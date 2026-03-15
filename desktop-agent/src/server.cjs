const express = require("express");

function createAgentServer(onActivity, onHeartbeat, getState) {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (req, res) => {
    res.json({ ok: true, agent: "cipher-desktop-agent", timestamp: Date.now() });
  });

  app.post("/activity", (req, res) => {
    const { domain, category, timeSpent, searchQuery, url } = req.body;
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "No authorization" });
    const d = domain || (url ? new URL(url).hostname : null);
    if (!d) return res.status(400).json({ message: "domain or url required" });
    onActivity({
      domain: d,
      category: category || "general",
      timeSpent: timeSpent || 60,
      searchQuery: searchQuery || "",
    }, auth);
    res.json({ ok: true });
  });

  app.post("/heartbeat", (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "No authorization" });
    onHeartbeat(auth);
    res.json({ ok: true });
  });

  app.get("/status", (req, res) => {
    res.json(getState());
  });

  return app;
}

module.exports = { createAgentServer };
