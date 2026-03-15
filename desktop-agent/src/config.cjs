const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const AGENT_PORT = parseInt(process.env.SPROUT_AGENT_PORT || process.env.CIPHER_AGENT_PORT || "3030", 10);
const BACKEND_URL = (process.env.SPROUT_BACKEND_URL || process.env.CIPHER_BACKEND_URL || "https://cipher-shds.onrender.com").replace(/\/$/, "");
const HEARTBEAT_INTERVAL_MS = 5000;
const TAMPER_THRESHOLD_MISSED = 4;
const MAX_ACTIVITY_LOGS = 100;

function getDataDir(app) {
  const dir = path.join(app.getPath("userData"), "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getOrCreateDeviceId(app) {
  const dir = getDataDir(app);
  const p = path.join(dir, "device-id.json");
  try {
    const data = JSON.parse(fs.readFileSync(p, "utf8"));
    if (data.deviceId) return data.deviceId;
  } catch (e) {}
  const deviceId = uuidv4();
  fs.writeFileSync(p, JSON.stringify({ deviceId, createdAt: new Date().toISOString() }));
  return deviceId;
}

module.exports = {
  AGENT_PORT,
  BACKEND_URL,
  HEARTBEAT_INTERVAL_MS,
  TAMPER_THRESHOLD_MISSED,
  MAX_ACTIVITY_LOGS,
  getDataDir,
  getOrCreateDeviceId,
};
