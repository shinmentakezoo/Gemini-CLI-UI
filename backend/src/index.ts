import express from 'express'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Import routes and middleware
import { authRoutes } from '@/routes/auth.js'
import { fileRoutes } from '@/routes/files.js'
import { projectRoutes } from '@/routes/projects.js'
import { geminiRoutes } from '@/routes/gemini.js'
import { terminalRoutes } from '@/routes/terminal.js'
import { gitRoutes } from '@/routes/git.js'

// Import services
import { setupWebSocket } from '@/services/websocket.js'
import { initializeDatabase } from '@/services/database.js'
import { logger } from '@/utils/logger.js'
import { errorHandler } from '@/middleware/errorHandler.js'
import { rateLimiter } from '@/middleware/rateLimiter.js'

// ES module compatibility
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:4009",
    methods: ["GET", "POST"],
    credentials: true
  }
})

const PORT = process.env.PORT || 4008
const NODE_ENV = process.env.NODE_ENV || 'development'

async function startServer() {
  try {
    // Initialize database
    await initializeDatabase()
    logger.info('Database initialized successfully')

    // Security middleware
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }))

    // CORS configuration
    app.use(cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:4009",
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }))

    // Compression and parsing middleware
    app.use(compression())
    app.use(express.json({ limit: '10mb' }))
    app.use(express.urlencoded({ extended: true, limit: '10mb' }))

    // Logging middleware
    if (NODE_ENV === 'development') {
      app.use(morgan('dev'))
    } else {
      app.use(morgan('combined'))
    }

    // Rate limiting
    app.use(rateLimiter)

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV,
        version: process.env.npm_package_version || '1.0.0'
      })
    })

    // API routes
    app.use('/api/auth', authRoutes)
    app.use('/api/files', fileRoutes)
    app.use('/api/projects', projectRoutes)
    app.use('/api/gemini', geminiRoutes)
    app.use('/api/terminal', terminalRoutes)
    app.use('/api/git', gitRoutes)

    // Setup WebSocket handlers
    setupWebSocket(io)

    // Error handling middleware (must be last)
    app.use(errorHandler)

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      })
    })

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Gemini CLI UI Backend started`)
      logger.info(`📡 Server running on http://localhost:${PORT}`)
      logger.info(`🌍 Environment: ${NODE_ENV}`)
      logger.info(`🔌 WebSocket server ready`)
      
      if (NODE_ENV === 'development') {
        logger.info(`📋 Health check: http://localhost:${PORT}/health`)
        logger.info(`📚 API docs: http://localhost:${PORT}/api`)
      }
    })

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully')
      server.close(() => {
        logger.info('Process terminated')
        process.exit(0)
      })
    })

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully')
      server.close(() => {
        logger.info('Process terminated')
        process.exit(0)
      })
    })

  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

// Start the server
startServer()
