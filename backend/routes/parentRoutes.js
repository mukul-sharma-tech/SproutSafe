import express from 'express';
import {
  getAllChildren,
  getChildDetails,
  getChildUrls,
  getChildAlerts,
  blockUrl,
  unblockUrl,
  resetTimeSpent,
  getNotifications,
  generateChildToken,
} from '../controller/parentContoller.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateRequest.js';

const router = express.Router();

router.use(verifyToken);

router.get('/children', getAllChildren);
router.get('/children/:id', getChildDetails);
router.get('/children/:id/urls', getChildUrls);
router.get('/children/:id/alerts', getChildAlerts);
router.get('/notifications', getNotifications);
router.post('/children/block', validate("blockUrl"), blockUrl);
router.post('/children/unblock', validate("unblockUrl"), unblockUrl);
router.post('/children/:id/reset', resetTimeSpent);
router.post('/children/:id/token', generateChildToken);

export default router;
