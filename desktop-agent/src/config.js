import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export const AGENT_PORT = parseInt(process.env.CIPHER_AGENT_PORT || "3030", 10);
export const BACKEND_URL = (process.env.CIPHER_BACKEND_URL || "https://cipher-shds.onrender.com").replace(/\/$/, "");
export const HEARTBEAT_INTERVAL_MS = 5000;
export const TAMPER_THRESHOLD_MISSED = 4;
export const MAX_ACTIVITY_LOGS = 100;

export function getDataDir(app) {
  const dir = path.join(app.getPath("userData"), "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getOrCreateDeviceId(app) {
  const dir = getDataDir(app);
  const p = path.join(dir, "device-id.json");
  try {
    const data = JSON.parse(fs.readFileSync(p, "utf8"));
    if (data.deviceId) return data.deviceId;
  } catch {}
  const deviceId = uuidv4();
  fs.writeFileSync(p, JSON.stringify({ deviceId, createdAt: new Date().toISOString() }));
  return deviceId;
}
