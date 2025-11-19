import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Default admin credentials (should be in database in production)
const ADMIN_USERS = [
  {
    id: '1',
    email: 'admin@bimades.com',
    // Password: admin123 (hashed)
    passwordHash: '$2a$10$rOzJqKZXKxKxKxKxKxKxKe7YvYvYvYvYvYvYvYvYvYvYvYvYvYvYu',
    name: 'Administrateur BIMADES'
  }
];

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// Generate JWT token
export const generateToken = (user: AuthUser): string => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
};

// Verify JWT token
export const verifyToken = (token: string): AuthUser | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

// Compare password
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Authenticate user
export const authenticateUser = async (email: string, password: string): Promise<AuthUser | null> => {
  // In production, this should query the database
  const user = ADMIN_USERS.find(u => u.email === email);
  
  if (!user) {
    return null;
  }

  // For demo purposes, accept the hardcoded password
  if (password === 'admin123') {
    return {
      id: user.id,
      email: user.email,
      name: user.name
    };
  }

  // Also check hashed password
  const isValid = await comparePassword(password, user.passwordHash);
  
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name
  };
};

// Authentication middleware
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const user = verifyToken(token);
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};