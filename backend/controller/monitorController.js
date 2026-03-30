import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Child from "../models/child.js";
import parent from "../models/parent.js";
import Log from "../models/log.js";
import SuperSafeSettings from "../models/superSafeSettings.js";
import AllowedSite from "../models/allowedSite.js";
import TimedBlock from "../models/timedBlock.js";
import { logActivity } from "../utillity/activityService.js";

export const monitorUrl = async (req, res) => {

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email } = decoded;
    const { domain, category = "general", timeSpent = 60, searchQuery } = req.body;

    const child = await Child.findOne({ email });
    if (!child) return res.status(404).json({ message: "Child not found" });

    const today = new Date().toISOString().split("T")[0];
    const existingUrl = child.monitoredUrls.find(url => url.domain === domain);

    if (existingUrl) {
      const currentTime = existingUrl.dailyTimeSpent.get(today) || 0;
      existingUrl.dailyTimeSpent.set(today, currentTime + timeSpent);
      if (searchQuery && !existingUrl.searchQueries.includes(searchQuery)) {
        existingUrl.searchQueries.push(searchQuery);
      }
      existingUrl.lastUpdated = new Date();
    } else {
      child.monitoredUrls.push({
        domain,
        category,
        dailyTimeSpent: new Map([[today, timeSpent]]),
        searchQueries: searchQuery ? [searchQuery] : [],
        lastUpdated: new Date()
      });
    }

    child.lastHeartbeat = new Date();
    child.status = "online";
    const fwd = req.headers["x-forwarded-for"];
    const ipHeader = Array.isArray(fwd) ? fwd[0] : fwd;
    const ip =
      (typeof ipHeader === "string" ? ipHeader.split(",")[0].trim() : "") ||
      req.ip ||
      req.socket.remoteAddress ||
      "";
    if (ip) {
      child.location = ip;
    }

    await child.save();

    if (searchQuery) {
      const msg = `🔍 Search: ${child.name} searched "${searchQuery}" on ${domain}`;
      await logActivity({
        child: child._id,
        type: "SEARCH_ACTIVITY",
        domain,
        message: msg,
      });
    } else {
      const msg = `🌐 Browsing: ${child.name} is on ${domain}`;
      await logActivity({
        child: child._id,
        type: "BROWSING_ACTIVITY",
        domain,
        message: msg,
      });
    }

    res.status(200).json({ message: "URL time updated successfully" });
  } catch (error) {
    console.error("Monitor URL Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const alertIncognito = async (req, res) => {
  const { url } = req.body;
  const email = req.user.email;

  if (!email || !url) {
    return res.status(400).json({ message: "Email and URL are required" });
  }

  try {
    const child = await Child.findOne({ email });

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    const now = new Date();
    child.incognitoAlerts.push({ url, timestamp: now });
    await child.save();

    const msg = `⚠️ Incognito: ${child.name} opened ${url} in private/incognito mode`;
    await logActivity({
      child: child._id,
      type: "INCOGNITO_ALERT",
      domain: url,
      message: msg,
    });

    res.status(200).json({ message: "Incognito alert stored" });

  } catch (err) {
    console.error("Error storing incognito alert:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const alertBlockedSearch = async (req, res) => {
  try {
    const { searchQuery, domain } = req.body;
    const { email } = req.user;

    if (!searchQuery) {
      return res.status(400).json({ message: "searchQuery is required" });
    }

    const child = await Child.findOne({ email });
    if (!child) return res.status(404).json({ message: "Child not found" });

    const msg = `🚨 Blocked search: ${child.name} searched "${searchQuery}" on ${domain || "unknown"} — tab was closed automatically`;
    await logActivity({
      child: child._id,
      type: "BLOCKED_SEARCH",
      domain: domain || "unknown",
      message: msg,
    });

    res.status(200).json({ message: "Blocked search alert logged" });
  } catch (err) {
    console.error("Blocked search alert error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkUrl = async (req, res) => {
  const { url } = req.body;
  const { email } = req.user;

  const child = await Child.findOne({ email });
  if (!child) return res.status(404).json({ blocked: false });

  // Existing manual block logic
  const isManuallyBlocked = child.blockedUrls.some((blockedUrl) => url.includes(blockedUrl));

  let superSafeBlocked = false;
  let superSafeEnabled = false;
  let voiceMessageUrl = null;

  try {
    const parentDoc = await parent.findOne({ children: child._id });
    if (parentDoc) {
      const settings = await SuperSafeSettings.findOne({ parent: parentDoc._id });
      superSafeEnabled = !!settings?.enabled;
      if (superSafeEnabled) {
        const normalized = url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
        const allowed = await AllowedSite.findOne({ parent: parentDoc._id, domain: normalized });
        superSafeBlocked = !allowed;
        voiceMessageUrl = settings?.voiceMessageUrl || null;
      }
    }
  } catch (err) {
    console.error("SuperSafe check error:", err);
  }

  // Check if there's an active timed access window that overrides blocks
  let timedAccessActive = false;
  try {
    const parentDoc = await parent.findOne({ children: child._id });
    if (parentDoc) {
      const normalized = url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].toLowerCase();
      const parts = normalized.split(".");
      const rootDomain = parts.length > 2 ? parts.slice(-2).join(".") : normalized;

      const timedBlock = await TimedBlock.findOne({
        parent: parentDoc._id,
        expiresAt: { $gt: new Date() },
        $or: [{ domain: normalized }, { domain: rootDomain }],
      });
      if (timedBlock) timedAccessActive = true;
    }
  } catch (err) {
    console.error("TimedBlock check error:", err);
  }

  const blocked = (isManuallyBlocked || superSafeBlocked) && !timedAccessActive;
  // Log and notify on blocked events
  if (blocked) {
    try {
      const msg = superSafeBlocked
        ? `🛑 SuperSafe blocked: ${child.name} tried to open ${url} — blocked by SuperSafe Mode`
        : `🚫 Blocked: ${child.name} tried to open ${url} — site is in your blocked list`;
      await logActivity({
        child: child._id,
        type: superSafeBlocked ? "SUPERSAFE_BLOCK" : "BLOCKED_URL",
        domain: url,
        message: msg,
      });
    } catch (err) {
      console.error("checkUrl activity log error:", err);
    }
  }
  res.json({
    blocked,
    superSafeEnabled,
    blockedBySuperSafe: superSafeBlocked,
    voiceMessageUrl,
  });
};

export const activateExtension = async (req, res) => {
  try {
    const { email } = req.user;
    const { password } = req.body;

    const child = await Child.findOne({ email });
    if (!child) return res.status(404).json({ message: "Child not found" });

    // Check for lockout
    if (child.lockoutUntil && child.lockoutUntil > new Date()) {
      return res.status(403).json({
        message: "Extension is locked due to multiple failed attempts",
        lockoutUntil: child.lockoutUntil
      });
    }

    const parentDoc = await parent.findOne({ children: child._id });
    if (!parentDoc) return res.status(404).json({ message: "Parent not found" });

    const validPassword = await bcrypt.compare(password, parentDoc.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid parent password" });
    }

    child.lastHeartbeat = new Date();
    child.status = 'online';
    await child.save();

    await logActivity({
      child: child._id,
      type: "EXTENSION_ACTIVATED",
      domain: null,
      message: `✅ Extension connected: ${child.name}'s CyberNest extension is now active`,
    });

    res.status(200).json({ message: "Extension activated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const disconnectExtension = async (req, res) => {
  try {
    const { email } = req.user;
    const { password } = req.body;

    const child = await Child.findOne({ email });
    if (!child) return res.status(404).json({ message: "Child not found" });

    // Check for lockout
    if (child.lockoutUntil && child.lockoutUntil > new Date()) {
      return res.status(403).json({
        message: "Extension is locked due to multiple failed attempts",
        lockoutUntil: child.lockoutUntil
      });
    }

    const parentDoc = await parent.findOne({ children: child._id });
    if (!parentDoc) return res.status(404).json({ message: "Parent not found" });

    const validPassword = await bcrypt.compare(password, parentDoc.password);
    if (!validPassword) {
      child.failedAttempts = (child.failedAttempts || 0) + 1;

      if (child.failedAttempts >= 3) {
        // Set lockout for 1 hour
        const lockoutTime = new Date(Date.now() + 60 * 60 * 1000);
        child.lockoutUntil = lockoutTime;
        child.failedAttempts = 0; // Reset after lockout
        await child.save();

        const alertMsg = `🔴 SECURITY ALERT: 3 wrong password attempts to disconnect ${child.name}'s extension. Locked for 1 hour until ${lockoutTime.toLocaleString()}.`;
        await logActivity({
          child: child._id,
          type: "SECURITY_ALERT",
          domain: null,
          message: alertMsg,
        });

        return res.status(403).json({
          message: "Too many failed attempts. Extension locked for 1 hour.",
          lockoutUntil: lockoutTime
        });
      } else {
        await child.save();
        return res.status(401).json({
          message: `Incorrect password. ${3 - child.failedAttempts} trials remaining.`,
          trialsRemaining: 3 - child.failedAttempts
        });
      }
    }

    // Success - Reset trials
    child.failedAttempts = 0;
    child.lockoutUntil = null;

    // Update status
    child.status = 'offline';
    await child.save();

    await logActivity({
      child: child._id,
      type: "EXTENSION_DISCONNECTED",
      domain: null,
      message: `❌ Extension disconnected: ${child.name}'s CyberNest extension has been turned off`,
    });

    res.status(200).json({ message: "Extension disconnected" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyRemoval = async (req, res) => {
  try {
    const { email } = req.user;
    const { password } = req.body;

    const child = await Child.findOne({ email });
    if (!child) return res.status(404).json({ message: "Child not found" });

    // Check for lockout
    if (child.lockoutUntil && child.lockoutUntil > new Date()) {
      return res.status(403).json({
        message: "Too many failed attempts. Extension locked.",
        lockoutUntil: child.lockoutUntil,
      });
    }

    const parentDoc = await parent.findOne({ children: child._id });
    if (!parentDoc) return res.status(404).json({ message: "Parent not found" });

    const validPassword = await bcrypt.compare(password, parentDoc.password);
    if (!validPassword) {
      child.failedAttempts = (child.failedAttempts || 0) + 1;

      if (child.failedAttempts >= 3) {
        const lockoutTime = new Date(Date.now() + 60 * 60 * 1000);
        child.lockoutUntil = lockoutTime;
        child.failedAttempts = 0;
        await child.save();

        await logActivity({
          child: child._id,
          type: "SECURITY_ALERT",
          domain: null,
          message: `🔴 SECURITY ALERT: 3 wrong password attempts to remove ${child.name}'s extension. Locked for 1 hour.`,
        });

        return res.status(403).json({
          message: "Too many failed attempts. Extension locked for 1 hour.",
          lockoutUntil: lockoutTime,
        });
      }

      await child.save();
      return res.status(401).json({
        message: `Incorrect password. ${3 - child.failedAttempts} attempt(s) remaining.`,
        trialsRemaining: 3 - child.failedAttempts,
      });
    }

    // Success
    child.failedAttempts = 0;
    child.lockoutUntil = null;
    await child.save();

    await logActivity({
      child: child._id,
      type: "EXTENSION_REMOVAL_AUTHORIZED",
      domain: null,
      message: `⚠️ Extension removal authorized for ${child.name} — parent password verified`,
    });

    res.status(200).json({ message: "Password verified. Extension removal authorized." });
  } catch (error) {
    console.error("Verify removal error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const tamperAlert = async (req, res) => {
  try {
    const { email } = req.user;
    const deviceId = req.headers["x-device-id"];

    const child = await Child.findOne({ email });
    if (!child) return res.status(404).json({ message: "Child not found" });

    child.status = "offline";
    await child.save();

    const deviceInfo = deviceId ? ` (Device: ${deviceId.slice(0, 8)}...)` : "";
    await logActivity({
      child: child._id,
      type: "TAMPER_ALERT",
      domain: null,
      message: `⚠️ TAMPER: Desktop agent detected extension stopped responding for ${child.name}${deviceInfo}. Extension may have been removed or disabled.`,
    });

    res.status(200).json({ message: "Tamper alert recorded" });
  } catch (error) {
    console.error("Tamper alert error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const tamperAlertFailed = async (req, res) => {
  try {
    res.status(200).json({ message: "Tamper alert failed recorded" });
  } catch (error) {
    console.error("Tamper alert failed notification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const agentEvent = async (req, res) => {
  try {
    const { email } = req.user;
    const { type } = req.body || {};
    const deviceId = req.headers["x-device-id"];

    const child = await Child.findOne({ email });
    if (!child) return res.status(404).json({ message: "Child not found" });

    const deviceInfo = deviceId ? ` (Device: ${deviceId.slice(0, 8)}...)` : "";
    const messages = {
      started: `🟢 Desktop agent started for ${child.name}${deviceInfo}`,
      stopped: `🔴 Desktop agent stopped for ${child.name}${deviceInfo}`,
      files_tampered: `⚠️ TAMPER: Agent files or config modified for ${child.name}${deviceInfo}`,
    };
    const msg = messages[type] || `Agent event: ${type} for ${child.name}${deviceInfo}`;

    await logActivity({
      child: child._id,
      type: "AGENT_EVENT",
      domain: null,
      message: msg,
    });

    res.status(200).json({ message: "Agent event recorded" });
  } catch (error) {
    console.error("Agent event error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


