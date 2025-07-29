import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '@/services/database.js'
import { logger } from '@/utils/logger.js'

// Extend Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string
      user?: any
    }
  }
}

interface JwtPayload {
  userId: string
  iat: number
  exp: number
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization header provided'
      })
      return
    }

    const token = authHeader.split(' ')[1] // Bearer <token>
    
    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      })
      return
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    
    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true
      }
    })

    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found'
      })
      return
    }

    // Add user info to request
    req.userId = user.id
    req.user = user

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      })
      return
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired'
      })
      return
    }

    logger.error('Auth middleware error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication failed'
    })
  }
}

// Optional auth middleware - doesn't fail if no token provided
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
      next()
      return
    }

    const token = authHeader.split(' ')[1]
    
    if (!token) {
      next()
      return
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    
    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true
      }
    })

    if (user) {
      req.userId = user.id
      req.user = user
    }

    next()
  } catch (error) {
    // Don't fail on auth errors in optional middleware
    logger.warn('Optional auth middleware error:', error)
    next()
  }
}
