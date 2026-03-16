import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getSettings,
  toggleSuperSafe,
  toggleBlockExtensionsPage,
  getAllowedSites,
  addAllowedSite,
  deleteAllowedSite,
  addCustomBlockedWord,
  removeCustomBlockedWord,
  uploadVoiceMessage,
  getVoiceMessage,
} from "../controller/superSafeController.js";

const router = express.Router();
const upload = multer(); // in-memory storage

router.use(verifyToken);

router.get("/settings", getSettings);
router.put("/toggle", toggleSuperSafe);
router.put("/toggle-block-extensions", toggleBlockExtensionsPage);
router.get("/allowed-sites", getAllowedSites);
router.post("/allowed-sites", addAllowedSite);
router.delete("/allowed-sites/:id", deleteAllowedSite);
router.post("/custom-blocked-words", addCustomBlockedWord);
router.delete("/custom-blocked-words", removeCustomBlockedWord);
router.post("/voice-message", upload.single("file"), uploadVoiceMessage);
router.get("/voice-message", getVoiceMessage);

export default router;

