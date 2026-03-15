/**
 * CommonJS entry point for Electron - bypasses ESM resolution issues with 'electron' module.
 */
const { app, Tray, Menu, nativeImage, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const http = require("http");
const fs = require("fs");

// Load .env file if present
try { require("dotenv").config({ path: path.join(__dirname, ".env") }); } catch (_) {}

const config = require("./src/config.cjs");
const auth = require("./src/auth.cjs");
const { createAgentServer } = require("./src/server.cjs");
const { createForwarder } = require("./src/forwarder.cjs");

const AGENT_PORT = config.AGENT_PORT;
const BACKEND_URL = config.BACKEND_URL;
const HEARTBEAT_INTERVAL_MS = config.HEARTBEAT_INTERVAL_MS;
const TAMPER_THRESHOLD_MISSED = config.TAMPER_THRESHOLD_MISSED;
const MAX_ACTIVITY_LOGS = config.MAX_ACTIVITY_LOGS;
const getOrCreateDeviceId = config.getOrCreateDeviceId;
const getDataDir = config.getDataDir;

let tray = null;
let httpServer = null;
let lastHeartbeat = null;
let lastToken = null;
let activityLogs = [];
let tamperAlertSent = false;
let deviceId = null;
let pendingQuit = false;
let verifyWin = null;
let currentVerifyAction = "quit";
let agentStartedNotified = false;

function log(msg) {
  const ts = new Date().toISOString();
  activityLogs.unshift({ ts, msg });
  activityLogs.length = Math.min(activityLogs.length, MAX_ACTIVITY_LOGS);
  console.log(`[${ts}] ${msg}`);
}

function onActivity(payload, authHeader) {
  lastToken = authHeader;
  if (!deviceId) return;
  const { forwardMonitorUrl } = createForwarder(BACKEND_URL, deviceId);
  forwardMonitorUrl(authHeader, {
    domain: payload.domain,
    category: payload.category,
    timeSpent: payload.timeSpent,
    searchQuery: payload.searchQuery || undefined,
  }).then(() => log(`Forwarded: ${payload.domain}`))
    .catch((err) => log(`Forward failed: ${err.message}`));
}

function onHeartbeat(authHeader) {
  lastToken = authHeader;
  lastHeartbeat = Date.now();
  tamperAlertSent = false;
}

function getState() {
  return {
    extensionActive: !tamperAlertSent,
    lastHeartbeat: lastHeartbeat ? new Date(lastHeartbeat).toISOString() : null,
    logs: activityLogs.slice(0, 20),
  };
}

function checkExtensionStatus() {
  if (!lastHeartbeat || !lastToken) return;
  const elapsed = Date.now() - lastHeartbeat;
  const threshold = HEARTBEAT_INTERVAL_MS * TAMPER_THRESHOLD_MISSED;
  if (elapsed > threshold && !tamperAlertSent && deviceId) {
    tamperAlertSent = true;
    const { sendTamperAlert, sendTamperAlertFailed } = createForwarder(BACKEND_URL, deviceId);
    sendTamperAlert(lastToken)
      .then(() => log("Tamper alert sent: extension stopped responding"))
      .catch(async (err) => {
        log(`Tamper alert failed: ${err.message}`);
        tamperAlertSent = false;
        try {
          await sendTamperAlertFailed(lastToken);
          log("Telegram alert sent for tamper failure");
        } catch (e) {
          log(`Telegram fallback failed: ${e.message}`);
        }
      });
  }
}

function notifyAgentStarted() {
  if (lastToken && deviceId) {
    const { sendAgentEvent } = createForwarder(BACKEND_URL, deviceId);
    sendAgentEvent(lastToken, "started").catch(() => {});
  }
}

function notifyAgentStopped() {
  if (lastToken && deviceId) {
    const { sendAgentEvent } = createForwarder(BACKEND_URL, deviceId);
    sendAgentEvent(lastToken, "stopped").catch(() => {});
  }
}

function sendFilesTamperedAlert() {
  if (lastToken && deviceId) {
    const { sendAgentEvent } = createForwarder(BACKEND_URL, deviceId);
    sendAgentEvent(lastToken, "files_tampered").catch(() => {});
  }
}

function checkFileIntegrity() {
  try {
    const dataDir = getDataDir(app);
    const deviceIdPath = path.join(dataDir, "device-id.json");
    if (!fs.existsSync(dataDir)) {
      sendFilesTamperedAlert();
      return false;
    }
    if (!fs.existsSync(deviceIdPath)) {
      sendFilesTamperedAlert();
      return false;
    }
    return true;
  } catch {
    sendFilesTamperedAlert();
    return false;
  }
}

function showSetupWindow() {
  const win = new BrowserWindow({
    width: 380,
    height: 320,
    resizable: false,
    alwaysOnTop: true,
    title: "Cipher Agent Setup",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, "assets", "setup.html"));
  return win;
}

function showVerifyWindow(action) {
  const win = new BrowserWindow({
    width: 360,
    height: 260,
    resizable: false,
    alwaysOnTop: true,
    modal: true,
    title: action === "uninstall" ? "Uninstall Agent" : "Quit Agent",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, "assets", "verify.html"), {
    hash: action === "uninstall" ? "uninstall" : "quit",
  });
  return win;
}

function requestQuit() {
  if (verifyWin) return;
  currentVerifyAction = "quit";
  verifyWin = showVerifyWindow("quit");
  verifyWin.on("closed", () => { verifyWin = null; });
}

function requestUninstall() {
  if (verifyWin) return;
  currentVerifyAction = "uninstall";
  verifyWin = showVerifyWindow("uninstall");
  verifyWin.on("closed", () => { verifyWin = null; });
}

function showUninstallInstructions() {
  const inst = new BrowserWindow({
    width: 420,
    height: 300,
    resizable: false,
    title: "Uninstall Instructions",
    webPreferences: { nodeIntegration: false },
  });
  inst.loadFile(path.join(__dirname, "assets", "uninstall.html"));
}

ipcMain.handle("auth:setPassword", async (_, plain) => {
  await auth.setPassword(app, plain);
  return true;
});

ipcMain.handle("auth:verifyPassword", async (_, plain) => {
  return auth.verifyPassword(app, plain);
});

ipcMain.on("auth:verified", () => {
  if (!verifyWin) return;
  const action = currentVerifyAction;
  verifyWin.close();
  verifyWin = null;
  if (action === "quit") {
    pendingQuit = true;
    notifyAgentStopped();
    app.quit();
  } else if (action === "uninstall") {
    showUninstallInstructions();
  }
});

function createTray() {
  const iconPath = path.join(__dirname, "assets", "icon.png");
  try {
    tray = new Tray(iconPath);
  } catch {
    tray = new Tray(nativeImage.createEmpty());
  }
  tray.setToolTip("Cipher Desktop Agent");
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: "Agent running", enabled: false },
    { type: "separator" },
    { label: "Quit", click: requestQuit },
    { label: "Uninstall Agent...", click: requestUninstall },
  ]));
}

function startServer() {
  const expressApp = createAgentServer(onActivity, onHeartbeat, getState);
  httpServer = http.createServer(expressApp);
  httpServer.listen(AGENT_PORT, "127.0.0.1", () => {
    log(`Agent listening on http://127.0.0.1:${AGENT_PORT}`);
  });
}

function runAgent() {
  createTray();
  startServer();
  setInterval(checkExtensionStatus, HEARTBEAT_INTERVAL_MS);
}

app.whenReady().then(async () => {
  delete process.env.ELECTRON_RUN_AS_NODE;
  app.setLoginItemSettings({ openAtLogin: true });
  deviceId = getOrCreateDeviceId(app);

  if (!auth.hasPassword(app)) {
    const setupWin = showSetupWindow();
    await new Promise((resolve) => {
      setupWin.on("closed", resolve);
    });
    if (!auth.hasPassword(app)) {
      app.quit();
      return;
    }
  }

  if (!checkFileIntegrity()) {
    log("File integrity check failed - config may have been tampered");
  }

  if (process.platform === "darwin") app.dock?.hide();
  runAgent();

  setInterval(() => {
    if (lastToken && deviceId) notifyAgentStarted();
  }, 60000);
});

app.on("before-quit", (e) => {
  if (!pendingQuit) {
    e.preventDefault();
    requestQuit();
  }
});

app.on("window-all-closed", (e) => e.preventDefault());

app.on("quit", () => {
  if (httpServer) httpServer.close();
});
