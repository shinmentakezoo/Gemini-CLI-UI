import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/services/api'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  clearError: () => void
  updateUser: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authApi.login({ email, password })
          const { user, token } = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Login failed'
          })
          throw error
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authApi.register({ email, password, name })
          const { user, token } = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Registration failed'
          })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
      },

      checkAuth: async () => {
        const { token } = get()
        
        if (!token) {
          set({ isLoading: false })
          return
        }

        set({ isLoading: true })
        
        try {
          const response = await authApi.me()
          const user = response.data
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      },

      clearError: () => {
        set({ error: null })
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...updates } })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
