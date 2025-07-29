import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  actualTheme: 'light' | 'dark'
}

interface ThemeActions {
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const getActualTheme = (theme: Theme): 'light' | 'dark' => {
  return theme === 'system' ? getSystemTheme() : theme
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set, get) => ({
      // State
      theme: 'system',
      actualTheme: getSystemTheme(),

      // Actions
      setTheme: (theme: Theme) => {
        const actualTheme = getActualTheme(theme)
        set({ theme, actualTheme })
        
        // Apply theme to document
        document.documentElement.classList.toggle('dark', actualTheme === 'dark')
      },

      toggleTheme: () => {
        const { theme } = get()
        const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'light' : 'dark'
        get().setTheme(newTheme)
      }
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme })
    }
  )
)

// Listen for system theme changes
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  mediaQuery.addEventListener('change', () => {
    const { theme, setTheme } = useThemeStore.getState()
    if (theme === 'system') {
      setTheme('system') // This will update the actualTheme
    }
  })
}
