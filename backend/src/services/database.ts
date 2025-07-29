import { PrismaClient } from '@prisma/client'
import { logger } from '@/utils/logger.js'

// Create Prisma client instance
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
})

// Database initialization function
export async function initializeDatabase(): Promise<void> {
  try {
    // Test database connection
    await prisma.$connect()
    logger.info('Database connected successfully')

    // Run any necessary migrations or setup
    await setupDatabase()
    
  } catch (error) {
    logger.error('Database connection failed:', error)
    throw error
  }
}

// Setup database with initial data if needed
async function setupDatabase(): Promise<void> {
  try {
    // Check if we need to create any initial data
    const userCount = await prisma.user.count()
    
    if (userCount === 0) {
      logger.info('Database is empty, setting up initial data...')
      // You can add initial data setup here if needed
    }
    
    logger.info('Database setup completed')
  } catch (error) {
    logger.error('Database setup failed:', error)
    throw error
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect()
    logger.info('Database disconnected successfully')
  } catch (error) {
    logger.error('Database disconnection failed:', error)
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    logger.error('Database health check failed:', error)
    return false
  }
}

// Transaction helper
export async function withTransaction<T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(callback)
}

// Cleanup function for tests
export async function cleanupDatabase(): Promise<void> {
  if (process.env.NODE_ENV === 'test') {
    const tablenames = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%';
    `
    
    for (const { name } of tablenames) {
      await prisma.$executeRawUnsafe(`DELETE FROM "${name}";`)
    }
  }
}
