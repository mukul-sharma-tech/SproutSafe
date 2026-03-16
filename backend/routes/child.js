import express from "express";
import { validate } from "../middleware/validateRequest.js";
import {
  clearAlerts,
  createChild,
  getAlerts,
  getAlertsFull,
  getBlockedStats,
  getBlockedStatsFull,
  getChildren,
  getSearchActivities,
  getWebUsageStats,
  getWebUsageStatsFull,
} from "../controller/childController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add-child", verifyToken, validate("addChild"), createChild);
router.get("/all", verifyToken, getChildren);
router.get("/web-usage/:email", verifyToken, getWebUsageStats);
router.get("/blocked/:email", verifyToken, getBlockedStats);
router.get("/alerts/:email", verifyToken, getAlerts);
router.get("/web-usagefull/:email", verifyToken, getWebUsageStatsFull);
router.get("/blockedfull/:email", verifyToken, getBlockedStatsFull);
router.get("/alertsfull/:email", verifyToken, getAlertsFull);
router.post("/web-usage-filtered", verifyToken, validate("webUsageFiltered"), getSearchActivities);
router.delete("/delete-alerts/:email", verifyToken, clearAlerts);

export default router;
