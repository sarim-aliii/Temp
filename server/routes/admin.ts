import { Router } from 'express';
import User from '../models/User';
import Waitlist from '../models/Waitlist';
import { approveWaitlistUser } from '../controllers/waitlistController';
import { requireAdmin } from '../middleware/adminMiddleware';
import { getAllFeedback } from '../controllers/feedbackController';


const router = Router();

// GET /api/admin/users - Fetch all registered users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -googleId')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch Waitlist Entries
router.get('/waitlist', requireAdmin, async (req, res) => {
  try {
    const entries = await Waitlist.find().sort({ createdAt: -1 });
    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/stats - Quick stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ isPremium: true });
    const waitlistCount = await Waitlist.countDocuments();
    
    const revenue = premiumUsers * 4.99; 

    res.json({ 
        totalUsers, 
        premiumUsers, 
        revenue, 
        waitlistCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/waitlist/:id/approve
// @desc    Approve a user and send the email
router.put('/waitlist/:id/approve', requireAdmin, approveWaitlistUser);

// GET /api/admin/feedback
router.get('/feedback', requireAdmin, getAllFeedback);


export default router;