import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcryptjs';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

// Generate JWT token
const generateToken = (id: string): string => {
  return sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d',
  });
};

// Register a new user
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, school_grade, subjects } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Please provide email, password, and name' });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user (password will be hashed in the User.save method)
    const user = new User({
      email,
      password,
      name,
      school_grade: school_grade || '',
      subjects: subjects || [],
    });

    // Save user to database
    await user.save();

    // Generate token
    const token = generateToken(user.id);

    // Return user and token
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      school_grade: user.school_grade,
      subjects: user.subjects,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Authenticate user and get token
export const authUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user and token
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      school_grade: user.school_grade,
      subjects: user.subjects,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile
export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user from middleware (req.user should be set by auth middleware)
    // Using non-null assertion since protect middleware ensures req.user exists
    const user = await User.findById(req.user!.id);

    if (user) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        school_grade: user.school_grade,
        subjects: user.subjects,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};