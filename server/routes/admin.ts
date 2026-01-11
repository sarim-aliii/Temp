import { Router } from 'express';
import User from '../models/User';
import Waitlist from '../models/Waitlist';
import { requireAdmin } from '../middleware/adminMiddleware';

const router = Router();


// GET /api/admin/users - Fetch all registered users
// Use 'requireAdmin' instead of 'verifyAdmin'
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
    const waitlistCount = await Waitlist.countDocuments(); // Add this
    
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

router.post('/waitlist/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and update the specific entry
    const entry = await Waitlist.findByIdAndUpdate(
      id,
      { approved: true },
      { new: true } // Return the updated document
    );

    if (!entry) {
      return res.status(404).json({ message: 'Waitlist entry not found' });
    }

    res.json({ success: true, data: entry });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


export default router;