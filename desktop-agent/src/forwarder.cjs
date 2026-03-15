const axios = require("axios");

function createForwarder(backendUrl, deviceId) {
  const api = axios.create({
    baseURL: backendUrl,
    timeout: 15000,
    headers: { "Content-Type": "application/json", "X-Device-ID": deviceId || "" },
  });

  function authHeader(token) {
    if (!token || typeof token !== "string") return {};
    const raw = token.trim().replace(/^Bearer\s+/i, "");
    if (!raw) return {};
    return { Authorization: `Bearer ${raw}` };
  }

  async function forwardMonitorUrl(token, payload) {
    await api.post("/api/monitor/monitor-url", payload, {
      headers: authHeader(token),
    });
  }

  async function sendTamperAlert(token) {
    await api.post("/api/monitor/tamper-alert", {}, {
      headers: authHeader(token),
    });
  }

  async function sendTamperAlertFailed(token) {
    await api.post("/api/monitor/tamper-alert-failed", {}, {
      headers: authHeader(token),
    });
  }

  async function sendAgentEvent(token, type) {
    await api.post("/api/monitor/agent-event", { type }, {
      headers: authHeader(token),
    });
  }

  return { forwardMonitorUrl, sendTamperAlert, sendTamperAlertFailed, sendAgentEvent };
}

module.exports = { createForwarder };
