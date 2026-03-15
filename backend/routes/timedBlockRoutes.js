import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getTimedBlocks,
  addTimedBlock,
  removeTimedBlock,
  checkTimedBlock,
  penalizeTimedBlock,
} from "../controller/timedBlockController.js";

const router = express.Router();
router.use(verifyToken);

router.get("/", getTimedBlocks);
router.post("/", addTimedBlock);
router.delete("/:id", removeTimedBlock);
router.post("/check", checkTimedBlock);
router.post("/penalize", penalizeTimedBlock);

export default router;
