import { Request, Response, NextFunction } from 'express'
import { z, ZodSchema } from 'zod'
import { logger } from '@/utils/logger.js'

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))

        logger.warn('Validation error:', { errors, body: req.body })

        res.status(400).json({
          error: 'Validation failed',
          message: 'Request data is invalid',
          details: errors
        })
        return
      }

      logger.error('Validation middleware error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Validation failed'
      })
    }
  }
}

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.query)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))

        logger.warn('Query validation error:', { errors, query: req.query })

        res.status(400).json({
          error: 'Validation failed',
          message: 'Query parameters are invalid',
          details: errors
        })
        return
      }

      logger.error('Query validation middleware error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Query validation failed'
      })
    }
  }
}

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.params)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))

        logger.warn('Params validation error:', { errors, params: req.params })

        res.status(400).json({
          error: 'Validation failed',
          message: 'URL parameters are invalid',
          details: errors
        })
        return
      }

      logger.error('Params validation middleware error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Parameter validation failed'
      })
    }
  }
}
