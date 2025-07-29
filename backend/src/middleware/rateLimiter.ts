import { Request, Response, NextFunction } from 'express'
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible'
import { logger } from '@/utils/logger.js'

// Rate limiter configuration
const rateLimiterConfig = {
  keyPrefix: 'gemini_cli_ui',
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Number of requests
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000, // Per 15 minutes (in seconds)
  blockDuration: 60, // Block for 1 minute if limit exceeded
}

// Create rate limiter instance
const rateLimiter = new RateLimiterMemory(rateLimiterConfig)

// Different rate limiters for different endpoints
const authRateLimiter = new RateLimiterMemory({
  ...rateLimiterConfig,
  points: 5, // 5 attempts
  duration: 900, // per 15 minutes
  blockDuration: 900, // block for 15 minutes
})

const apiRateLimiter = new RateLimiterMemory({
  ...rateLimiterConfig,
  points: 1000, // 1000 requests
  duration: 3600, // per hour
  blockDuration: 300, // block for 5 minutes
})

const geminiRateLimiter = new RateLimiterMemory({
  ...rateLimiterConfig,
  points: 50, // 50 AI requests
  duration: 3600, // per hour
  blockDuration: 600, // block for 10 minutes
})

// Helper function to get client IP
const getClientIP = (req: Request): string => {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection as any)?.socket?.remoteAddress ||
    '127.0.0.1'
  )
}

// Helper function to get rate limit key
const getRateLimitKey = (req: Request): string => {
  const ip = getClientIP(req)
  const userId = req.userId || 'anonymous'
  return `${ip}:${userId}`
}

// Generic rate limiter middleware
export const createRateLimiter = (limiter: RateLimiterMemory) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = getRateLimitKey(req)
      
      await limiter.consume(key)
      
      // Add rate limit headers
      const resRateLimiter = await limiter.get(key)
      if (resRateLimiter) {
        res.set({
          'X-RateLimit-Limit': rateLimiterConfig.points.toString(),
          'X-RateLimit-Remaining': resRateLimiter.remainingPoints?.toString() || '0',
          'X-RateLimit-Reset': new Date(Date.now() + resRateLimiter.msBeforeNext).toISOString(),
        })
      }
      
      next()
    } catch (rejRes: any) {
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1
      
      logger.warn('Rate limit exceeded', {
        ip: getClientIP(req),
        userId: req.userId,
        path: req.path,
        method: req.method,
        retryAfter: secs
      })
      
      res.set('Retry-After', secs.toString())
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: secs
      })
    }
  }
}

// Default rate limiter
export const rateLimiter = createRateLimiter(rateLimiter)

// Auth-specific rate limiter
export const authRateLimit = createRateLimiter(authRateLimiter)

// API-specific rate limiter
export const apiRateLimit = createRateLimiter(apiRateLimiter)

// Gemini AI-specific rate limiter
export const geminiRateLimit = createRateLimiter(geminiRateLimiter)

// Bypass rate limiting for certain conditions
export const bypassRateLimit = (req: Request): boolean => {
  // Bypass for health checks
  if (req.path === '/health') {
    return true
  }
  
  // Bypass for localhost in development
  if (process.env.NODE_ENV === 'development' && getClientIP(req) === '127.0.0.1') {
    return true
  }
  
  // Bypass for specific user roles (if implemented)
  // if (req.user?.role === 'admin') {
  //   return true
  // }
  
  return false
}

// Enhanced rate limiter with bypass logic
export const smartRateLimiter = (limiter: RateLimiterMemory) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (bypassRateLimit(req)) {
      next()
      return
    }
    
    return createRateLimiter(limiter)(req, res, next)
  }
}
