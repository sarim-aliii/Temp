import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error(`[Error] ${req.method} ${req.path}:`, err);
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any = undefined;

  // 1. Check if it's our custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } 
  // 2. Handle Zod Validation Errors
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.issues.map(e => ({ 
      field: e.path.join('.'), 
      message: e.message 
    }));
  }
  // 3. Handle common Mongoose/Database errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((val: any) => val.message);
  } 
  else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid Token. Please log in again.';
  }

  // 4. Send Response
  res.status(statusCode).json({
    success: false,
    message: message,
    errors: errors,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};