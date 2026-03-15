import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { app, Tray, Menu, nativeImage } = require("electron");
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { createAgentServer } from "./server.js";
import { createForwarder } from "./forwarder.js";
import {
  AGENT_PORT,
  BACKEND_URL,
  HEARTBEAT_INTERVAL_MS,
  TAMPER_THRESHOLD_MISSED,
  MAX_ACTIVITY_LOGS,
  getOrCreateDeviceId,
} from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let tray = null;
let httpServer = null;
let lastHeartbeat = null;
let lastToken = null;
let activityLogs = [];
let extensionActive = false;
let tamperAlertSent = false;
let deviceId = null;

function log(msg) {
  const ts = new Date().toISOString();
  activityLogs.unshift({ ts, msg });
  activityLogs = activityLogs.slice(0, MAX_ACTIVITY_LOGS);
  console.log(`[${ts}] ${msg}`);
}

function onActivity(payload, auth) {
  lastToken = auth;
  if (!deviceId) return;
  const { forwardMonitorUrl } = createForwarder(BACKEND_URL, deviceId);
  forwardMonitorUrl(auth, {
    domain: payload.domain,
    category: payload.category,
    timeSpent: payload.timeSpent,
    searchQuery: payload.searchQuery || undefined,
  }).then(() => {
    log(`Forwarded: ${payload.domain}`);
  }).catch((err) => {
    log(`Forward failed: ${err.message}`);
  });
}

function onHeartbeat(auth) {
  lastToken = auth;
  lastHeartbeat = Date.now();
  extensionActive = true;
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
    extensionActive = false;
    const { sendTamperAlert } = createForwarder(BACKEND_URL, deviceId);
    sendTamperAlert(lastToken).then(() => {
      log("Tamper alert sent: extension stopped responding");
    }).catch((err) => {
      log(`Tamper alert failed: ${err.message}`);
      tamperAlertSent = false;
    });
  }
}

function createTray() {
  const iconPath = path.join(__dirname, "..", "assets", "icon.png");
  try {
    tray = new Tray(iconPath);
  } catch {
    tray = new Tray(nativeImage.createEmpty());
  }
  tray.setToolTip("Cipher Desktop Agent");
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: "Agent running", enabled: false },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]));
}

function startServer() {
  const expressApp = createAgentServer(onActivity, onHeartbeat, getState);
  httpServer = http.createServer(expressApp);
  httpServer.listen(AGENT_PORT, "127.0.0.1", () => {
    log(`Agent listening on http://127.0.0.1:${AGENT_PORT}`);
  });
}

app.whenReady().then(() => {
  app.setLoginItemSettings({ openAtLogin: true });
  deviceId = getOrCreateDeviceId(app);
  if (process.platform === "darwin") app.dock?.hide();
  createTray();
  startServer();
  setInterval(checkExtensionStatus, HEARTBEAT_INTERVAL_MS);
});

app.on("window-all-closed", (e) => e.preventDefault());
app.on("quit", () => { if (httpServer) httpServer.close(); });
