import express from "express";
import { register, login, changePassword, getParent, getVerificationStatus, setVerified, syncUser } from "../controller/authContoller.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateRequest.js";

const router = express.Router();
router.post("/signup", validate("signup"), register);
router.post("/login", validate("login"), login);
router.post("/sync", syncUser);
router.put("/change-password", verifyToken, validate("changePassword"), changePassword);
router.get("/user", verifyToken, getParent);
router.get("/verification-status", verifyToken, getVerificationStatus);
router.post("/verify", verifyToken, setVerified);

export default router;
