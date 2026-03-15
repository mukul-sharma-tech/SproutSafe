import express from "express";

export function createAgentServer(onActivity, onHeartbeat, getState) {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (req, res) => {
    res.json({ ok: true, agent: "cipher-desktop-agent", timestamp: Date.now() });
  });

  app.post("/activity", (req, res) => {
    const { domain, category, timeSpent, searchQuery, url, tabId } = req.body;
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "No authorization" });
    if (!domain && !url) return res.status(400).json({ message: "domain or url required" });
    const d = domain || (url ? new URL(url).hostname : null);
    if (!d) return res.status(400).json({ message: "Invalid domain/url" });
    onActivity({
      domain: d,
      category: category || "general",
      timeSpent: timeSpent || 60,
      searchQuery: searchQuery || "",
      url: url || null,
      tabId,
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
