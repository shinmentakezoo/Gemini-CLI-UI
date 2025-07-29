import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { Toaster } from '@/components/ui/toaster'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Pages
import LoginPage from '@/pages/LoginPage'
import IDEPage from '@/pages/IDEPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function App() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/ide" replace /> : <LoginPage />
          } 
        />
        <Route 
          path="/ide" 
          element={
            <ProtectedRoute>
              <IDEPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/" 
          element={
            <Navigate to={isAuthenticated ? "/ide" : "/login"} replace />
          } 
        />
        <Route 
          path="*" 
          element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-muted-foreground mb-4">Page not found</p>
                <a 
                  href="/" 
                  className="text-primary hover:underline"
                >
                  Go back home
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
