import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';


export const errorHandler = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error(`[Error] ${req.method} ${req.path}:`, err);
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors = undefined;

  // 1. Check if it's our custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } 
  // 2. Handle common Mongoose/Database errors (Optional but recommended)
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

  // 3. Send Response in the format React expects
  res.status(statusCode).json({
    success: false,
    message: message,
    errors: errors,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};