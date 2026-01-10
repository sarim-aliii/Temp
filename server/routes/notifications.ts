import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// POST /api/notifications/subscribe
router.post('/subscribe', authMiddleware, asyncHandler(async (req, res) => {
  const subscription = req.body;
  const user = await User.findById(req.user!.id);
  
  if (user) {
    user.pushSubscription = subscription;
    await user.save();
    res.status(200).json({ success: true, message: 'Push subscription saved.' });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
}));

export default router;