import express from "express";
import {
  monitorUrl,
  alertIncognito,
  alertBlockedSearch,
  checkUrl,
  activateExtension,
  disconnectExtension,
  verifyRemoval,
  tamperAlert,
  tamperAlertFailed,
  agentEvent,
} from "../controller/monitorController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/monitor-url", verifyToken, monitorUrl);
router.post("/incognito-alert", verifyToken, alertIncognito);
router.post("/blocked-search", verifyToken, alertBlockedSearch);
router.post("/check-url", verifyToken, checkUrl);
router.post("/activate", verifyToken, activateExtension);
router.post("/disconnect", verifyToken, disconnectExtension);
router.post("/verify-removal", verifyToken, verifyRemoval);
router.get("/extension-removed-notify", (req, res) => {
  // Chrome opens this URL after extension is removed — just acknowledge
  res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#0f172a;color:#e5e7eb">
    <h2>⚠️ CyberNest Extension Removed</h2>
    <p>The CyberNest extension has been removed from this browser. The parent account has been notified.</p>
  </body></html>`);
});
router.post("/tamper-alert", verifyToken, tamperAlert);
router.post("/tamper-alert-failed", verifyToken, tamperAlertFailed);
router.post("/agent-event", verifyToken, agentEvent);

export default router;
