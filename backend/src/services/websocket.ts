import { Server as SocketIOServer, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { prisma } from '@/services/database.js'
import { logger } from '@/utils/logger.js'

interface AuthenticatedSocket extends Socket {
  userId?: string
  user?: any
}

interface SocketData {
  userId: string
  user: any
}

// WebSocket event types
export enum WSEvents {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  
  // Authentication events
  AUTHENTICATE = 'authenticate',
  AUTHENTICATED = 'authenticated',
  AUTHENTICATION_ERROR = 'authentication_error',
  
  // File events
  FILE_CHANGED = 'file_changed',
  FILE_CREATED = 'file_created',
  FILE_DELETED = 'file_deleted',
  FILE_RENAMED = 'file_renamed',
  
  // Editor events
  EDITOR_CURSOR_CHANGE = 'editor_cursor_change',
  EDITOR_SELECTION_CHANGE = 'editor_selection_change',
  EDITOR_CONTENT_CHANGE = 'editor_content_change',
  
  // Terminal events
  TERMINAL_DATA = 'terminal_data',
  TERMINAL_RESIZE = 'terminal_resize',
  TERMINAL_CREATED = 'terminal_created',
  TERMINAL_CLOSED = 'terminal_closed',
  
  // Chat events
  CHAT_MESSAGE = 'chat_message',
  CHAT_TYPING = 'chat_typing',
  CHAT_STOP_TYPING = 'chat_stop_typing',
  
  // Project events
  PROJECT_OPENED = 'project_opened',
  PROJECT_CLOSED = 'project_closed',
  PROJECT_CHANGED = 'project_changed',
  
  // Git events
  GIT_STATUS_CHANGED = 'git_status_changed',
  GIT_BRANCH_CHANGED = 'git_branch_changed',
  
  // System events
  SYSTEM_NOTIFICATION = 'system_notification',
  ERROR = 'error',
}

// Connected users map
const connectedUsers = new Map<string, Set<string>>() // userId -> Set of socketIds
const socketUsers = new Map<string, string>() // socketId -> userId

export function setupWebSocket(io: SocketIOServer): void {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1]
      
      if (!token) {
        return next(new Error('Authentication token required'))
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true
        }
      })

      if (!user) {
        return next(new Error('User not found'))
      }

      socket.userId = user.id
      socket.user = user
      
      next()
    } catch (error) {
      logger.error('WebSocket authentication error:', error)
      next(new Error('Authentication failed'))
    }
  })

  io.on(WSEvents.CONNECT, (socket: AuthenticatedSocket) => {
    const userId = socket.userId!
    const socketId = socket.id

    logger.websocket('connected', socketId, { userId, userEmail: socket.user?.email })

    // Track connected user
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set())
    }
    connectedUsers.get(userId)!.add(socketId)
    socketUsers.set(socketId, userId)

    // Join user-specific room
    socket.join(`user:${userId}`)

    // Send authentication success
    socket.emit(WSEvents.AUTHENTICATED, {
      user: socket.user,
      timestamp: new Date().toISOString()
    })

    // Handle file watching
    socket.on('watch_file', (data: { path: string }) => {
      socket.join(`file:${data.path}`)
      logger.websocket('watching file', socketId, { path: data.path })
    })

    socket.on('unwatch_file', (data: { path: string }) => {
      socket.leave(`file:${data.path}`)
      logger.websocket('unwatching file', socketId, { path: data.path })
    })

    // Handle project rooms
    socket.on('join_project', (data: { projectId: string }) => {
      socket.join(`project:${data.projectId}`)
      logger.websocket('joined project', socketId, { projectId: data.projectId })
    })

    socket.on('leave_project', (data: { projectId: string }) => {
      socket.leave(`project:${data.projectId}`)
      logger.websocket('left project', socketId, { projectId: data.projectId })
    })

    // Handle editor collaboration
    socket.on(WSEvents.EDITOR_CURSOR_CHANGE, (data) => {
      socket.to(`file:${data.filePath}`).emit(WSEvents.EDITOR_CURSOR_CHANGE, {
        ...data,
        userId,
        user: socket.user
      })
    })

    socket.on(WSEvents.EDITOR_SELECTION_CHANGE, (data) => {
      socket.to(`file:${data.filePath}`).emit(WSEvents.EDITOR_SELECTION_CHANGE, {
        ...data,
        userId,
        user: socket.user
      })
    })

    socket.on(WSEvents.EDITOR_CONTENT_CHANGE, (data) => {
      socket.to(`file:${data.filePath}`).emit(WSEvents.EDITOR_CONTENT_CHANGE, {
        ...data,
        userId,
        user: socket.user
      })
    })

    // Handle terminal events
    socket.on(WSEvents.TERMINAL_DATA, (data: { sessionId: string; data: string }) => {
      // Broadcast to other users in the same project
      socket.to(`terminal:${data.sessionId}`).emit(WSEvents.TERMINAL_DATA, data)
    })

    socket.on('join_terminal', (data: { sessionId: string }) => {
      socket.join(`terminal:${data.sessionId}`)
      logger.websocket('joined terminal', socketId, { sessionId: data.sessionId })
    })

    socket.on('leave_terminal', (data: { sessionId: string }) => {
      socket.leave(`terminal:${data.sessionId}`)
      logger.websocket('left terminal', socketId, { sessionId: data.sessionId })
    })

    // Handle chat events
    socket.on(WSEvents.CHAT_TYPING, (data: { projectId?: string }) => {
      const room = data.projectId ? `project:${data.projectId}` : `user:${userId}`
      socket.to(room).emit(WSEvents.CHAT_TYPING, {
        userId,
        user: socket.user,
        timestamp: new Date().toISOString()
      })
    })

    socket.on(WSEvents.CHAT_STOP_TYPING, (data: { projectId?: string }) => {
      const room = data.projectId ? `project:${data.projectId}` : `user:${userId}`
      socket.to(room).emit(WSEvents.CHAT_STOP_TYPING, {
        userId,
        user: socket.user,
        timestamp: new Date().toISOString()
      })
    })

    // Handle disconnect
    socket.on(WSEvents.DISCONNECT, (reason) => {
      logger.websocket('disconnected', socketId, { userId, reason })

      // Remove from tracking
      const userSockets = connectedUsers.get(userId)
      if (userSockets) {
        userSockets.delete(socketId)
        if (userSockets.size === 0) {
          connectedUsers.delete(userId)
        }
      }
      socketUsers.delete(socketId)
    })

    // Handle errors
    socket.on('error', (error) => {
      logger.error('WebSocket error:', { socketId, userId, error })
    })
  })

  // Broadcast system notifications
  setInterval(() => {
    const connectedCount = socketUsers.size
    const userCount = connectedUsers.size
    
    if (connectedCount > 0) {
      logger.debug(`WebSocket Status: ${connectedCount} connections, ${userCount} users`)
    }
  }, 60000) // Every minute
}

// Helper functions to broadcast events
export const broadcastToUser = (io: SocketIOServer, userId: string, event: string, data: any): void => {
  io.to(`user:${userId}`).emit(event, data)
}

export const broadcastToProject = (io: SocketIOServer, projectId: string, event: string, data: any): void => {
  io.to(`project:${projectId}`).emit(event, data)
}

export const broadcastToFile = (io: SocketIOServer, filePath: string, event: string, data: any): void => {
  io.to(`file:${filePath}`).emit(event, data)
}

export const broadcastToAll = (io: SocketIOServer, event: string, data: any): void => {
  io.emit(event, data)
}

export const getConnectedUsers = (): Map<string, Set<string>> => {
  return connectedUsers
}

export const isUserConnected = (userId: string): boolean => {
  return connectedUsers.has(userId)
}

export const getUserSocketCount = (userId: string): number => {
  return connectedUsers.get(userId)?.size || 0
}
