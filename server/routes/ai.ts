import { Router } from 'express';
import { refineMessage } from '../controllers/aiController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/ai/refine - Protected route
router.post('/refine', authMiddleware, refineMessage);

export default router;