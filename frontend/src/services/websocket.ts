import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/authStore'

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

class WebSocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private eventListeners: Map<string, Set<Function>> = new Map()

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = useAuthStore.getState().token
      
      if (!token) {
        reject(new Error('No authentication token available'))
        return
      }

      // Create socket connection
      this.socket = io(process.env.VITE_WS_URL || 'ws://localhost:4008', {
        auth: {
          token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      })

      // Connection successful
      this.socket.on(WSEvents.CONNECT, () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        resolve()
      })

      // Authentication successful
      this.socket.on(WSEvents.AUTHENTICATED, (data) => {
        console.log('WebSocket authenticated:', data)
      })

      // Authentication failed
      this.socket.on(WSEvents.AUTHENTICATION_ERROR, (error) => {
        console.error('WebSocket authentication failed:', error)
        reject(new Error('Authentication failed'))
      })

      // Connection error
      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error)
        this.handleReconnect()
        reject(error)
      })

      // Disconnection
      this.socket.on(WSEvents.DISCONNECT, (reason) => {
        console.log('WebSocket disconnected:', reason)
        
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          this.handleReconnect()
        }
      })

      // Setup event forwarding
      this.setupEventForwarding()
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.eventListeners.clear()
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`)
      
      setTimeout(() => {
        this.connect().catch(console.error)
      }, delay)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  private setupEventForwarding(): void {
    if (!this.socket) return

    // Forward all events to registered listeners
    Object.values(WSEvents).forEach(event => {
      this.socket!.on(event, (data) => {
        this.emit(event, data)
      })
    })
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(callback)
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(callback)
      if (listeners.size === 0) {
        this.eventListeners.delete(event)
      }
    }
  }

  emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in event listener:', error)
        }
      })
    }
  }

  // Send events to server
  send(event: string, data?: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn('WebSocket not connected, cannot send event:', event)
    }
  }

  // File watching
  watchFile(path: string): void {
    this.send('watch_file', { path })
  }

  unwatchFile(path: string): void {
    this.send('unwatch_file', { path })
  }

  // Project management
  joinProject(projectId: string): void {
    this.send('join_project', { projectId })
  }

  leaveProject(projectId: string): void {
    this.send('leave_project', { projectId })
  }

  // Terminal management
  joinTerminal(sessionId: string): void {
    this.send('join_terminal', { sessionId })
  }

  leaveTerminal(sessionId: string): void {
    this.send('leave_terminal', { sessionId })
  }

  // Editor collaboration
  sendCursorChange(filePath: string, line: number, column: number): void {
    this.send(WSEvents.EDITOR_CURSOR_CHANGE, {
      filePath,
      line,
      column,
      timestamp: Date.now()
    })
  }

  sendSelectionChange(filePath: string, selection: any): void {
    this.send(WSEvents.EDITOR_SELECTION_CHANGE, {
      filePath,
      selection,
      timestamp: Date.now()
    })
  }

  sendContentChange(filePath: string, changes: any): void {
    this.send(WSEvents.EDITOR_CONTENT_CHANGE, {
      filePath,
      changes,
      timestamp: Date.now()
    })
  }

  // Chat events
  sendChatTyping(projectId?: string): void {
    this.send(WSEvents.CHAT_TYPING, { projectId })
  }

  sendChatStopTyping(projectId?: string): void {
    this.send(WSEvents.CHAT_STOP_TYPING, { projectId })
  }

  // Connection status
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getSocket(): Socket | null {
    return this.socket
  }
}

// Create singleton instance
export const wsService = new WebSocketService()

// Auto-connect when auth token is available
useAuthStore.subscribe(
  (state) => state.token,
  (token) => {
    if (token && !wsService.isConnected()) {
      wsService.connect().catch(console.error)
    } else if (!token && wsService.isConnected()) {
      wsService.disconnect()
    }
  }
)
