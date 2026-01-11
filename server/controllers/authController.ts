import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import { firebaseAdmin } from '../config/firebaseAdmin';
import { sendEmail } from '../utils/emailService';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  googleLoginSchema
} from '../validators';


const DUMMY_HASH = '$2a$10$zP4.r517.1UL.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1';

// Helper: Generate JWT
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
};

// Helper: Generate OTP, Save to User, and Send Email
const generateAndSendOTP = async (
  user: IUser,
  type: 'verification' | 'reset',
  subject: string,
  title: string,
  introText: string
) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const hash = crypto.createHash('sha256').update(otp).digest('hex');
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 Minutes

  if (type === 'verification') {
    user.verificationToken = hash;
    // user.verificationCodeExpires = expires;
  } else {
    user.resetPasswordToken = hash;
    user.resetPasswordExpire = expires;
  }

  await user.save();

  const message = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>${title}</h2>
      <p>${introText}</p>
      <p>Please use the following code:</p>
      
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
        <h1 style="color: #333; margin: 0; letter-spacing: 5px;">${otp}</h1>
      </div>

      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: subject,
    html: message,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  // Validate Input
  const validatedData = await registerSchema.parseAsync(req.body);
  const { email, password, name } = validatedData;

  let user = await User.findOne({ email });

  if (user) {
    if (user.isVerified) {
      throw new AppError('An account with this email already exists.', 400);
    }
    user.password = password;
    user.name = name || user.name;
  } else {
    user = new User({
      email,
      password,
      name: name || email.split('@')[0],
      authMethod: 'email',
      isVerified: false,
      avatar: 'https://picsum.photos/200'
    });
  }

  try {
    await generateAndSendOTP(
      user,
      'verification',
      'BlurChats - Verify Your Account',
      'Verify Your Email',
      'Thanks for signing up for BlurChats!'
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for the verification code.',
      email: user.email
    });
  } catch (emailError) {
    console.error("Email send failed:", emailError);
    throw new AppError('User registered, but failed to send verification email.', 500);
  }
});


// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = await loginSchema.parseAsync(req.body);

  const user = await User.findOne({ email }).select('+passHash');
  const targetHash = user?.passHash || DUMMY_HASH;
  const isMatch = await bcrypt.compare(password, targetHash);

  if (!user || !isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.authMethod !== 'email') {
    throw new AppError(`This account uses ${user.authMethod}. Please sign in with that method.`, 401);
  }

  // Check if verified
  if (!user.isVerified) {
    throw new AppError('Please verify your email address before logging in.', 403);
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    token: generateToken(user.id.toString()),
    isVerified: user.isVerified,
    pairedWithUserId: user.pairedWithUserId
  });
});


// @desc    Verify User Email
// @route   POST /api/auth/verify-email
// @access  Public (No Token Required)
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  // Validate Input
  const { email, token } = await verifyEmailSchema.parseAsync(req.body);

  const cleanEmail = String(email).toLowerCase().trim();
  const cleanToken = String(token).replace(/\s+/g, '');

  const user = await User.findOne({ email: cleanEmail }).select('+verificationToken');

  if (!user) {
    throw new AppError('Invalid verification code or email.', 400);
  }

  if (user.isVerified) {
    return res.status(200).json({
      message: "Email is already verified. Please login.",
      isVerified: true
    });
  }

  const verificationTokenHash = crypto.createHash('sha256').update(cleanToken).digest('hex');

  if (user.verificationToken !== verificationTokenHash) {
    throw new AppError('Invalid verification code.', 400);
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  res.status(200).json({
    message: "Email verified successfully",
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    token: generateToken(user.id.toString()),
    pairedWithUserId: user.pairedWithUserId
  });
});


// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  // No body validation needed for GET request
  const user = await User.findById(req.user?.id).select('-password');
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isPremium: user.isPremium,
      isVerified: user.isVerified,
      pairedWithUserId: user.pairedWithUserId,
    });
  } else {
    throw new AppError('User not found', 404);
  }
});

// @desc    Resend Verification Email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerificationEmail = asyncHandler(async (req: Request, res: Response) => {
  // Validate Input
  const { email } = await resendVerificationSchema.parseAsync(req.body);

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isVerified) {
    throw new AppError("This account is already verified.", 400);
  }

  await generateAndSendOTP(
    user,
    'verification',
    'BlurChats - New Verification Code',
    'Verify Your Email',
    'You requested a new verification code.'
  );

  res.status(200).json({ message: "Verification code sent" });
});

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  // Validate Input
  const { email } = await forgotPasswordSchema.parseAsync(req.body);
  const cleanEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: cleanEmail });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.authMethod === 'google') {
    throw new AppError(`You registered with ${user.authMethod}. Please sign in with that.`, 400);
  }

  try {
    await generateAndSendOTP(
      user,
      'reset',
      'BlurChats - Password Reset Code',
      'Reset Your Password',
      'You requested to reset your password.'
    );
    res.status(200).json({ message: "OTP sent to email" });
  } catch (emailError) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    throw new AppError("Email could not be sent", 500);
  }
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  // Validate Input
  const { email, otp, password } = await resetPasswordSchema.parseAsync(req.body);

  const resetPasswordTokenHash = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
    resetPasswordToken: resetPasswordTokenHash,
    resetPasswordExpire: { $gt: new Date() }
  });

  if (!user) {
    throw new AppError("Invalid Code or Expired", 400);
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({ message: "Password updated successfully" });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  // Validate Input
  const validatedBody = await updateProfileSchema.parseAsync(req.body);
  const user = await User.findById(req.user?.id);

  if (user) {
    user.name = validatedBody.name || user.name;
    user.avatar = validatedBody.avatar || user.avatar;
    if (validatedBody.password) {
      user.password = validatedBody.password;
    }
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      pairedWithUserId: updatedUser.pairedWithUserId
    });
  } else {
    throw new AppError('User not found', 404);
  }
});

// Helper for Social Login (Firebase)
const socialLoginHandler = async (req: Request, res: Response, provider: 'google') => {
  const { idToken } = await googleLoginSchema.parseAsync(req.body);

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    let { email, uid, picture, name } = decodedToken;

    if (!email) {
      console.warn(`[${provider}] Email missing for UID: ${uid}. Using placeholder.`);
      email = `${uid}@${provider}.placeholder.com`;
    }

    let user = await User.findOne({ email });

    if (user) {
      if (user.authMethod !== provider && user.authMethod !== 'email' && !user.email.includes('.placeholder.com')) {
        throw new AppError(`This email is already associated with a ${user.authMethod} account.`, 400);
      }

      user.authMethod = provider;
      if (!user.isVerified) user.isVerified = true;
      await user.save();

    } else {
      user = await User.create({
        email,
        name: name || email?.split('@')[0] || 'User',
        avatar: picture || 'avatar-1',
        authMethod: provider,
        isVerified: true
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user.id.toString()),
      pairedWithUserId: user.pairedWithUserId
    });

  } catch (error: any) {
    if (error.name === 'ZodError') throw error;

    console.error(`${provider} Auth Error:`, error);
    if (error instanceof AppError) throw error;
    throw new AppError(`${provider} Sign-In failed. Invalid token.`, 401);
  }
};

// @desc    Google Login (Firebase - kept if needed for Mobile/API)
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  await socialLoginHandler(req, res, 'google');
});