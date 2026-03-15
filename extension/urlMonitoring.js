// Change to "http://localhost:5000" for local development
// Change to "https://cipher-shds.onrender.com" for production
const BACKEND_URL = "http://localhost:5000";
const AGENT_URL = "http://127.0.0.1:3030";
const HEARTBEAT_INTERVAL_MS = 5000;

let agentAvailable = null;

async function checkAgentHealth() {
  try {
    const res = await fetch(`${AGENT_URL}/health`, { method: "GET", signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendToAgent(path, token, body) {
  try {
    const res = await fetch(`${AGENT_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ================= HELPERS ================= */

async function syncSuperSafeSettings() {
  try {
    const { token } = await chrome.storage.local.get("token");
    if (!token) return;
    const res = await fetch(`${BACKEND_URL}/api/supersafe/settings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return;
    const settings = await res.json();
    await chrome.storage.local.set({ superSafeSettings: settings });
  } catch (err) {
    console.error("SuperSafe settings sync failed", err);
  }
}

/* ================= INCOGNITO MONITOR ================= */

chrome.windows.onCreated.addListener((window) => {
  if (window.incognito) {
    chrome.windows.remove(window.id);
    alertIncognitoOpen("Incognito Window Attempt");
  }
});

async function alertIncognitoOpen(url) {
  const { token } = await chrome.storage.local.get("token");
  if (!token) return;

  try {
    await fetch(`${BACKEND_URL}/api/monitor/incognito-alert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        incognitoDetected: true,
        url,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.error("Incognito alert failed", err);
  }
}

/* ================= EXTENSIONS PAGE BLOCKER ================= */

async function checkAndBlockExtensionsPage(tabId, url) {
  if (!url) return;
  if (!url.startsWith("chrome://extensions")) return;

  const { token } = await chrome.storage.local.get("token");
  if (!token) return;

  let blockEnabled = false;
  try {
    const res = await fetch(`${BACKEND_URL}/api/supersafe/settings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const settings = await res.json();
      await chrome.storage.local.set({ superSafeSettings: settings });
      blockEnabled = settings.blockExtensionsPage !== false;
    }
  } catch {
    const { superSafeSettings } = await chrome.storage.local.get("superSafeSettings");
    blockEnabled = superSafeSettings?.blockExtensionsPage !== false;
  }

  if (!blockEnabled) return;

  try {
    await chrome.tabs.remove(tabId);
  } catch {}

  try {
    await fetch(`${BACKEND_URL}/api/monitor/incognito-alert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        incognitoDetected: false,
        url: "chrome://extensions (blocked)",
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {}
}

/* ================= BLOCKED SEARCH KEYWORDS ================= */

const BLOCKED_SEARCH_KEYWORDS = [
  // Bypass / VPN
  "proxy", "proxies", "web proxy", "free proxy",
  "vpn", "free vpn", "vpn extension", "vpn chrome",
  "unblock sites", "unblock websites", "unblock school",
  "bypass filter", "bypass blocker", "bypass parental control",
  "bypass restriction", "bypass firewall",
  "how to unblock", "how to bypass", "how to disable parental",
  "remove parental control", "disable parental control",
  "turn off parental control", "get around parental control",
  "unblocker", "site unblocker", "ultrasurf", "psiphon",
  "hide browsing", "hide history", "anonymous browsing",
  "tor browser", "tor download",
  "disable sproutsafe", "remove sproutsafe", "uninstall sproutsafe",
  "disable extension", "remove extension", "uninstall extension",
  "chrome extension remove", "how to remove chrome extension",
  // Violence / harmful
  "how to kill", "how to murder", "how to make a bomb",
  "how to make poison", "suicide methods", "how to hurt",
  // Adult / explicit English
  "porn", "pornography", "xxx", "xxx videos", "sex video",
  "nude photos", "nude images", "naked photos", "naked girls",
  "hentai", "rape video", "child porn", "lolita", "cp porn",
  "adult video", "adult content", "onlyfans leak",
  // Adult / explicit Hindi
  "chutiya", "chutiye", "randi", "madarchod", "gandu",
  "lund", "chut", "bhosdike", "harami", "gaand",
  "chudai", "chudai video", "sexy video hindi",
];

function containsBlockedKeyword(query) {
  if (!query) return null;
  const lower = query.toLowerCase();
  return BLOCKED_SEARCH_KEYWORDS.find((kw) => lower.includes(kw)) || null;
}

async function alertBlockedSearch(token, searchQuery, domain) {
  try {
    await fetch(`${BACKEND_URL}/api/monitor/blocked-search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ searchQuery, domain }),
    });
  } catch {}
}

async function checkAndBlockSearchQuery(tabId, url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    if (!domain.includes("google.com") && !domain.includes("bing.com") && !domain.includes("yahoo.com")) {
      return false;
    }
    const params = new URLSearchParams(urlObj.search);
    const query = params.get("q") || params.get("p") || "";
    const matched = containsBlockedKeyword(query);
    if (!matched) return false;

    const { token } = await chrome.storage.local.get("token");
    if (!token) return false;

    try { await chrome.tabs.remove(tabId); } catch {}
    await alertBlockedSearch(token, query, domain);
    return true;
  } catch {
    return false;
  }
}

/* ================= ACTIVE TAB MONITOR ================= */

async function updateActiveTabToBackend() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tab?.url?.startsWith("http")) return;

  const { token } = await chrome.storage.local.get("token");
  if (!token) return;

  const urlObj = new URL(tab.url);
  const domain = urlObj.hostname;
  let searchQuery = "";

  if (domain.includes("google.com") || domain.includes("bing.com") || domain.includes("yahoo.com")) {
    const params = new URLSearchParams(urlObj.search);
    searchQuery = params.get("q") || params.get("p") || "";
  }

  const matchedKeyword = containsBlockedKeyword(searchQuery);
  if (matchedKeyword) {
    try {
      await chrome.tabs.remove(tab.id);
    } catch {}
    await alertBlockedSearch(token, searchQuery, domain);
    return;
  }

  const payload = { domain, searchQuery, timeSpent: 60 };
  try {
    if (agentAvailable !== false) {
      const ok = await sendToAgent("/activity", token, { ...payload, url: tab.url, tabId: tab.id });
      if (ok) {
        agentAvailable = true;
        return;
      }
      agentAvailable = false;
    }
    await fetch(`${BACKEND_URL}/api/monitor/monitor-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Active tab update failed", err);
  }
}

/* ================= TIMED ACCESS â€“ DUPLICATE TAB PENALTY ================= */

async function checkTimedAccessDuplicate(tabId, url) {
  try {
    const domain = new URL(url).hostname;
    const { token } = await chrome.storage.local.get("token");
    if (!token) return;

    const res = await fetch(`${BACKEND_URL}/api/timed-blocks/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ domain }),
    });
    if (!res.ok) return;
    const data = await res.json();
    if (!data.blocked) return;

    // Site has an active timed access window â€” check for duplicate tabs
    const allTabs = await chrome.tabs.query({});
    const matchingTabs = allTabs.filter((t) => {
      try { return t.url && new URL(t.url).hostname === domain; } catch { return false; }
    });

    if (matchingTabs.length > 1) {
      // Penalize: set timer to 0 so the site is blocked again immediately
      try {
        await fetch(`${BACKEND_URL}/api/timed-blocks/penalize`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ domain }),
        });
      } catch {}
      for (const t of matchingTabs) {
        try { await chrome.tabs.remove(t.id); } catch {}
      }
    }
  } catch {}
}

/* ================= BLOCKED SITE CHECK ================= */

async function checkUrlWithBackend(domain) {
  const { token } = await chrome.storage.local.get("token");
  if (!token) return { blocked: false };

  try {
    const res = await fetch(`${BACKEND_URL}/api/monitor/check-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url: domain }),
    });

    if (!res.ok) return { blocked: false };
    return await res.json();
  } catch (err) {
    console.error("URL check failed", err);
    return { blocked: false };
  }
}

async function handleTab(tabId, url) {
  try {
    const domain = new URL(url).hostname;
    const result = await checkUrlWithBackend(domain);

    if (result.blocked) {
      // Store info for the warning page
      await chrome.storage.local.set({
        supersafeWarning: {
          domain,
          voiceMessageUrl: result.voiceMessageUrl || null,
          blockedBySuperSafe: !!result.blockedBySuperSafe,
        },
      });

      // Redirect to local warning page
      await chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL("warning.html"),
      });
    }
  } catch { }
}

/* ================= TAB LISTENERS ================= */

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.url?.startsWith("chrome://extensions")) {
    checkAndBlockExtensionsPage(tabId, changeInfo.url);
    return;
  }
  if (changeInfo.url?.startsWith("http")) {
    const searchBlocked = await checkAndBlockSearchQuery(tabId, changeInfo.url);
    if (searchBlocked) return;
    // Check for duplicate tabs on timed-access sites (runs in parallel, doesn't block flow)
    checkTimedAccessDuplicate(tabId, changeInfo.url);
    handleTab(tabId, changeInfo.url);
    updateActiveTabToBackend();
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.url?.startsWith("chrome://extensions")) {
      checkAndBlockExtensionsPage(tabId, tab.url);
      return;
    }
    if (tab.url?.startsWith("http")) {
      const searchBlocked = await checkAndBlockSearchQuery(tabId, tab.url);
      if (searchBlocked) return;
      checkTimedAccessDuplicate(tabId, tab.url);
      handleTab(tabId, tab.url);
      updateActiveTabToBackend();
    }
  } catch {}
});

/* ================= PERIODIC MONITORING ================= */

setInterval(updateActiveTabToBackend, 60000);

// Desktop agent heartbeat: every 5 seconds
setInterval(async () => {
  if (agentAvailable === false) return;
  const { token } = await chrome.storage.local.get("token");
  if (!token) return;
  const ok = await sendToAgent("/heartbeat", token, {});
  agentAvailable = ok;
}, HEARTBEAT_INTERVAL_MS);

// Check agent on startup
(async () => {
  agentAvailable = await checkAgentHealth();
})();

// Initial sync when service worker starts, then every 2 minutes
syncSuperSafeSettings();
setInterval(syncSuperSafeSettings, 120000);
