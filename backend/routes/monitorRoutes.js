import express from "express";
import {
  monitorUrl,
  alertIncognito,
  alertBlockedSearch,
  checkUrl,
  activateExtension,
  disconnectExtension,
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
router.post("/tamper-alert", verifyToken, tamperAlert);
router.post("/tamper-alert-failed", verifyToken, tamperAlertFailed);
router.post("/agent-event", verifyToken, agentEvent);

export default router;
