import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().min(1, 'Verification code is required'),
});

export const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().min(1, 'OTP is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().url().optional(),
  password: z.string().min(6).optional(),
});

export const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'other']),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const googleLoginSchema = z.object({
  idToken: z.string().min(1, 'ID Token is required'),
});