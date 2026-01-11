import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../middleware/auth';
import { 
  registerUser, 
  loginUser, 
  verifyEmail, 
  getUserProfile, 
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  googleLogin
} from '../controllers/authController';

const router = Router();

// Specific limiter for login to prevent brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: "Too many login attempts, please try again after 15 minutes." }
});

router.post('/signup', registerUser);
router.post('/login', loginLimiter, loginUser); // Applied here
router.post('/verify-email', verifyEmail); 
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleLogin);
router.get('/me', authMiddleware, getUserProfile);

// Google OAuth Routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/#/login?error=true` : 'http://localhost:3000/#/login?error=true',
    failureMessage: true,
    session: false,
  }),

  (req, res) => {
    // Generate token for the redirected user
    const user: any = req.user;
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
        console.error('JWT_SECRET missing');
        return res.redirect('/#/login?error=server_config');
    }

    const token = jwt.sign({ id: user.id }, jwtSecret, {
      expiresIn: '30d', 
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    res.cookie('token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000
    });

    res.redirect(`${frontendUrl}/#/auth/callback`);
  }
);

export default router;