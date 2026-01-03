import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import Logger from '../utils/logger';

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header('authorization');
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token format is "Bearer <token>"' });
  }

  const token = parts[1];

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      Logger.error('JWT_SECRET is not defined in server .env');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, jwtSecret) as { id: string };
    
    // Find the user but exclude their hash
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found, token invalid' });
    }
    
    req.user = user; // Attach the full user document (minus hash)
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token is expired', code: 'TOKEN_EXPIRED' });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Token is not valid', code: 'TOKEN_INVALID' });
    }
    res.status(501).json({ message: 'Error validating token' });
  }
};

interface JwtPayload {
  id: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
         res.status(401).json({ message: 'Not authorized, user not found' });
         return;
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};