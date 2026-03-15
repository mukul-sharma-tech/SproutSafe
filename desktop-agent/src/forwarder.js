import axios from "axios";

export function createForwarder(backendUrl, deviceId) {
  const api = axios.create({
    baseURL: backendUrl,
    timeout: 15000,
    headers: { "Content-Type": "application/json", "X-Device-ID": deviceId },
  });

  async function forwardMonitorUrl(token, payload) {
    try {
      await api.post("/api/monitor/monitor-url", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      throw err;
    }
  }

  async function sendTamperAlert(token) {
    try {
      await api.post("/api/monitor/tamper-alert", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      throw err;
    }
  }

  return { forwardMonitorUrl, sendTamperAlert };
}
