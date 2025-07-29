import { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger.js'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
  code?: string
}

// Custom error classes
export class ValidationError extends Error {
  statusCode = 400
  isOperational = true
  code = 'VALIDATION_ERROR'

  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error {
  statusCode = 401
  isOperational = true
  code = 'AUTHENTICATION_ERROR'

  constructor(message: string = 'Authentication failed') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  statusCode = 403
  isOperational = true
  code = 'AUTHORIZATION_ERROR'

  constructor(message: string = 'Access denied') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends Error {
  statusCode = 404
  isOperational = true
  code = 'NOT_FOUND_ERROR'

  constructor(message: string = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error {
  statusCode = 409
  isOperational = true
  code = 'CONFLICT_ERROR'

  constructor(message: string = 'Resource conflict') {
    super(message)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends Error {
  statusCode = 429
  isOperational = true
  code = 'RATE_LIMIT_ERROR'

  constructor(message: string = 'Too many requests') {
    super(message)
    this.name = 'RateLimitError'
  }
}

export class InternalServerError extends Error {
  statusCode = 500
  isOperational = false
  code = 'INTERNAL_SERVER_ERROR'

  constructor(message: string = 'Internal server error') {
    super(message)
    this.name = 'InternalServerError'
  }
}

// Error response interface
interface ErrorResponse {
  error: string
  message: string
  code?: string
  details?: any
  timestamp: string
  path: string
  method: string
  requestId?: string
}

// Main error handler middleware
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Set default error properties
  const statusCode = error.statusCode || 500
  const isOperational = error.isOperational || false

  // Log error
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    statusCode,
    isOperational,
    code: error.code,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.userId,
    body: req.body,
    query: req.query,
    params: req.params
  }

  if (statusCode >= 500) {
    logger.error('Server Error:', errorInfo)
  } else {
    logger.warn('Client Error:', errorInfo)
  }

  // Prepare error response
  const errorResponse: ErrorResponse = {
    error: error.name || 'Error',
    message: error.message,
    code: error.code,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    (errorResponse as any).stack = error.stack
    (errorResponse as any).details = errorInfo
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    errorResponse.error = 'Validation Error'
  } else if (error.name === 'CastError') {
    errorResponse.error = 'Invalid ID'
    errorResponse.message = 'Invalid resource ID format'
  } else if (error.name === 'MongoError' && (error as any).code === 11000) {
    errorResponse.error = 'Duplicate Field'
    errorResponse.message = 'Resource already exists'
  } else if (error.name === 'JsonWebTokenError') {
    errorResponse.error = 'Invalid Token'
    errorResponse.message = 'Authentication token is invalid'
  } else if (error.name === 'TokenExpiredError') {
    errorResponse.error = 'Token Expired'
    errorResponse.message = 'Authentication token has expired'
  }

  // Send error response
  res.status(statusCode).json(errorResponse)
}

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`)
  next(error)
}

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Promise Rejection:', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise
  })
  
  // Graceful shutdown
  process.exit(1)
})

// Uncaught exception handler
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', {
    message: error.message,
    stack: error.stack
  })
  
  // Graceful shutdown
  process.exit(1)
})
