import { Router } from 'express';
import { submitFeedback } from '../controllers/feedbackController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// @route   POST /api/feedback
// @desc    Submit user feedback or bug report
// @access  Private
router.post('/', authMiddleware, submitFeedback);

export default router;