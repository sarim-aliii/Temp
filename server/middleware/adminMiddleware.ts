import { Request, Response, NextFunction } from 'express';
import Logger from '../utils/logger';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const secretKey = process.env.ADMIN_SECRET_KEY;
  // Safely convert header to string to satisfy strict TypeScript types
  const providedKey = req.headers['x-admin-key']?.toString();

  // If no key is set in .env, block everything for safety
  if (!secretKey) {
    console.error('❌ ADMIN_SECRET_KEY is missing in .env');
    res.status(500).json({ message: 'Server configuration error' });
    return;
  }

  if (providedKey !== secretKey) {
    Logger.warn(`Unauthorized reset attempt from ${req.ip}`);
    res.status(403).json({ 
      success: false, 
      message: 'Forbidden: Invalid or missing admin key' 
    });
    return;
  }

  next();
};