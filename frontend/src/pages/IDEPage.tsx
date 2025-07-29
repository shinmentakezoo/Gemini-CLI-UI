import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const IDEPage: React.FC = () => {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading IDE components
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleLogout = () => {
    logout()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading Gemini CLI UI...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary">Gemini CLI UI</h1>
            <span className="text-sm text-muted-foreground">
              Advanced Web-Based IDE
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? '🌞' : '🌙'}
            </Button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main IDE Interface */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Explorer</h2>
            
            {/* File Explorer Placeholder */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer">
                <span>📁</span>
                <span className="text-sm">src</span>
              </div>
              <div className="flex items-center space-x-2 p-2 pl-6 rounded hover:bg-accent cursor-pointer">
                <span>📄</span>
                <span className="text-sm">App.tsx</span>
              </div>
              <div className="flex items-center space-x-2 p-2 pl-6 rounded hover:bg-accent cursor-pointer">
                <span>📄</span>
                <span className="text-sm">index.tsx</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer">
                <span>📄</span>
                <span className="text-sm">package.json</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          {/* Tab Bar */}
          <div className="border-b border-border bg-card">
            <div className="flex">
              <div className="flex items-center px-4 py-2 border-r border-border bg-background">
                <span className="text-sm">App.tsx</span>
                <button className="ml-2 text-muted-foreground hover:text-foreground">
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex">
            {/* Code Editor */}
            <div className="flex-1 bg-background">
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">Monaco Editor</h3>
                  <p className="text-muted-foreground mb-4">
                    Advanced code editor will be integrated here
                  </p>
                  <div className="bg-card p-4 rounded-lg border">
                    <pre className="text-left text-sm">
{`import React from 'react'

function App() {
  return (
    <div className="App">
      <h1>Welcome to Gemini CLI UI</h1>
      <p>AI-powered development environment</p>
    </div>
  )
}

export default App`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Chat Panel */}
            <aside className="w-80 border-l border-border bg-card">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">AI Assistant</h3>
                
                <div className="space-y-4 mb-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>AI:</strong> Hello! I'm your Gemini-powered coding assistant. 
                      How can I help you today?
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Ask me anything..."
                    className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-sm"
                  />
                  <Button size="sm">Send</Button>
                </div>
              </div>
            </aside>
          </div>

          {/* Terminal */}
          <div className="h-48 border-t border-border bg-card">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Terminal</h3>
              <div className="bg-background p-4 rounded-lg border font-mono text-sm">
                <div className="text-green-500">$ npm run dev</div>
                <div className="text-muted-foreground">
                  Starting development server...
                </div>
                <div className="text-muted-foreground">
                  Server running on http://localhost:4009
                </div>
                <div className="text-green-500">$ _</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default IDEPage
