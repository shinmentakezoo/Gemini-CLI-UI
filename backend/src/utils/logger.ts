import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  timestamp: string
  level: string
  message: string
  data?: any
}

class Logger {
  private logLevel: LogLevel
  private logFile?: string
  private writeStream?: NodeJS.WritableStream

  constructor() {
    this.logLevel = this.getLogLevel()
    this.setupLogFile()
  }

  private getLogLevel(): LogLevel {
    const level = process.env.LOG_LEVEL?.toLowerCase() || 'info'
    switch (level) {
      case 'error':
        return LogLevel.ERROR
      case 'warn':
        return LogLevel.WARN
      case 'info':
        return LogLevel.INFO
      case 'debug':
        return LogLevel.DEBUG
      default:
        return LogLevel.INFO
    }
  }

  private setupLogFile(): void {
    if (process.env.LOG_FILE) {
      this.logFile = process.env.LOG_FILE
      const logDir = dirname(this.logFile)
      
      // Create log directory if it doesn't exist
      if (!existsSync(logDir)) {
        mkdirSync(logDir, { recursive: true })
      }
      
      this.writeStream = createWriteStream(this.logFile, { flags: 'a' })
    }
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const logEntry: LogEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(data && { data })
    }
    
    return JSON.stringify(logEntry)
  }

  private log(level: LogLevel, levelName: string, message: string, data?: any): void {
    if (level > this.logLevel) return

    const formattedMessage = this.formatMessage(levelName, message, data)
    
    // Console output with colors
    if (process.env.NODE_ENV !== 'production') {
      const colors = {
        ERROR: '\x1b[31m', // Red
        WARN: '\x1b[33m',  // Yellow
        INFO: '\x1b[36m',  // Cyan
        DEBUG: '\x1b[35m', // Magenta
        RESET: '\x1b[0m'
      }
      
      const color = colors[levelName as keyof typeof colors] || colors.RESET
      console.log(`${color}[${levelName}]${colors.RESET} ${message}`, data || '')
    }
    
    // File output
    if (this.writeStream) {
      this.writeStream.write(formattedMessage + '\n')
    }
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, 'ERROR', message, data)
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, data)
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, data)
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, data)
  }

  // HTTP request logging
  request(method: string, url: string, statusCode: number, responseTime: number, userAgent?: string): void {
    const message = `${method} ${url} ${statusCode} ${responseTime}ms`
    const data = { method, url, statusCode, responseTime, userAgent }
    this.info(message, data)
  }

  // Performance logging
  performance(operation: string, duration: number, metadata?: any): void {
    const message = `Performance: ${operation} took ${duration}ms`
    const data = { operation, duration, ...metadata }
    this.info(message, data)
  }

  // Security logging
  security(event: string, details: any): void {
    const message = `Security Event: ${event}`
    this.warn(message, details)
  }

  // Database logging
  database(query: string, duration: number, error?: any): void {
    if (error) {
      this.error(`Database Error: ${query}`, { duration, error })
    } else {
      this.debug(`Database Query: ${query} (${duration}ms)`)
    }
  }

  // WebSocket logging
  websocket(event: string, socketId: string, data?: any): void {
    const message = `WebSocket ${event}: ${socketId}`
    this.debug(message, data)
  }

  // Cleanup
  close(): void {
    if (this.writeStream) {
      this.writeStream.end()
    }
  }
}

// Create singleton instance
export const logger = new Logger()

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.close()
})

process.on('SIGINT', () => {
  logger.close()
})
