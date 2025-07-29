import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '@/services/database.js'
import { authMiddleware } from '@/middleware/auth.js'
import { validateRequest } from '@/middleware/validation.js'
import { logger } from '@/utils/logger.js'

const router = Router()

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters')
})

// Helper function to generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// Helper function to create user response (without password)
const createUserResponse = (user: any) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  avatar: user.avatar,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
})

// POST /api/auth/register
router.post('/register', validateRequest(registerSchema), async (req, res) => {
  try {
    const { email, password, name } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    })

    // Generate token
    const token = generateToken(user.id)

    logger.info(`User registered: ${email}`)

    res.status(201).json({
      message: 'User registered successfully',
      user: createUserResponse(user),
      token
    })
  } catch (error) {
    logger.error('Registration error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to register user'
    })
  }
})

// POST /api/auth/login
router.post('/login', validateRequest(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      })
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Generate token
    const token = generateToken(user.id)

    logger.info(`User logged in: ${email}`)

    res.json({
      message: 'Login successful',
      user: createUserResponse(user),
      token
    })
  } catch (error) {
    logger.error('Login error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to login'
    })
  }
})

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    })

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found'
      })
    }

    res.json(createUserResponse(user))
  } catch (error) {
    logger.error('Get user error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user information'
    })
  }
})

// POST /api/auth/logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // In a more sophisticated implementation, you might want to blacklist the token
    // For now, we'll just return success and let the client handle token removal
    
    logger.info(`User logged out: ${req.userId}`)
    
    res.json({
      message: 'Logout successful'
    })
  } catch (error) {
    logger.error('Logout error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to logout'
    })
  }
})

// POST /api/auth/refresh
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    })

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found'
      })
    }

    // Generate new token
    const token = generateToken(user.id)

    res.json({
      message: 'Token refreshed successfully',
      token,
      user: createUserResponse(user)
    })
  } catch (error) {
    logger.error('Token refresh error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to refresh token'
    })
  }
})

export { router as authRoutes }
