import { Router } from 'express';
import { 
  registerWaitlist, 
  getWaitlistPosition, 
  getWaitlistStats, 
  resetWaitlist 
} from '../controllers/waitlistController';
import { requireAdmin } from '../middleware/adminMiddleware';

const router = Router();

router.post('/register', registerWaitlist);
router.get('/position/:email', getWaitlistPosition);
router.get('/stats', getWaitlistStats);
router.delete('/reset', requireAdmin, resetWaitlist);

export default router;