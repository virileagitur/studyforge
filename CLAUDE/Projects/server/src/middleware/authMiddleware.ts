import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { User } from '../models/User';

// Protect middleware
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Debug logging
      console.log('Token:', token);
      console.log('JWT Secret:', process.env.JWT_SECRET);

      // Verify token
      const decoded: any = verify(token, process.env.JWT_SECRET || 'fallback_secret');

      // Get user from token
      const user = await User.findById(decoded.id);

      // If user doesn't exist, return unauthorized
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Attach user id to request object
      req.user = { id: user.id };

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export default protect;