import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export interface EditorTab {
  id: string
  path: string
  name: string
  content: string
  isDirty: boolean
  language: string
  isActive: boolean
  cursorPosition?: { line: number; column: number }
}

interface EditorState {
  tabs: EditorTab[]
  activeTabId: string | null
  isLoading: boolean
  error: string | null
}

interface EditorActions {
  openFile: (path: string, content: string, language?: string) => void
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  updateTabContent: (tabId: string, content: string) => void
  saveTab: (tabId: string) => Promise<void>
  saveAllTabs: () => Promise<void>
  markTabClean: (tabId: string) => void
  setCursorPosition: (tabId: string, line: number, column: number) => void
  closeAllTabs: () => void
  closeOtherTabs: (tabId: string) => void
  getActiveTab: () => EditorTab | null
  getTabById: (tabId: string) => EditorTab | null
}

export const useEditorStore = create<EditorState & EditorActions>()(
  subscribeWithSelector((set, get) => ({
    // State
    tabs: [],
    activeTabId: null,
    isLoading: false,
    error: null,

    // Actions
    openFile: (path: string, content: string, language = 'typescript') => {
      const { tabs } = get()
      
      // Check if file is already open
      const existingTab = tabs.find(tab => tab.path === path)
      if (existingTab) {
        set({ activeTabId: existingTab.id })
        return
      }

      // Create new tab
      const newTab: EditorTab = {
        id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        path,
        name: path.split('/').pop() || 'Untitled',
        content,
        isDirty: false,
        language,
        isActive: true
      }

      // Deactivate other tabs
      const updatedTabs = tabs.map(tab => ({ ...tab, isActive: false }))
      
      set({
        tabs: [...updatedTabs, newTab],
        activeTabId: newTab.id
      })
    },

    closeTab: (tabId: string) => {
      const { tabs, activeTabId } = get()
      const tabIndex = tabs.findIndex(tab => tab.id === tabId)
      
      if (tabIndex === -1) return

      const newTabs = tabs.filter(tab => tab.id !== tabId)
      let newActiveTabId = activeTabId

      // If closing the active tab, switch to another tab
      if (activeTabId === tabId) {
        if (newTabs.length > 0) {
          // Switch to the tab to the right, or left if at the end
          const newActiveIndex = tabIndex < newTabs.length ? tabIndex : tabIndex - 1
          newActiveTabId = newTabs[newActiveIndex]?.id || null
          
          if (newActiveTabId) {
            newTabs[newActiveIndex].isActive = true
          }
        } else {
          newActiveTabId = null
        }
      }

      set({
        tabs: newTabs,
        activeTabId: newActiveTabId
      })
    },

    setActiveTab: (tabId: string) => {
      const { tabs } = get()
      
      const updatedTabs = tabs.map(tab => ({
        ...tab,
        isActive: tab.id === tabId
      }))

      set({
        tabs: updatedTabs,
        activeTabId: tabId
      })
    },

    updateTabContent: (tabId: string, content: string) => {
      const { tabs } = get()
      
      const updatedTabs = tabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, content, isDirty: tab.content !== content }
          : tab
      )

      set({ tabs: updatedTabs })
    },

    saveTab: async (tabId: string) => {
      const { tabs } = get()
      const tab = tabs.find(t => t.id === tabId)
      
      if (!tab) return

      try {
        set({ isLoading: true, error: null })
        
        // Here you would call the API to save the file
        // await filesApi.saveFile(tab.path, tab.content)
        
        // Mark tab as clean
        get().markTabClean(tabId)
        
        set({ isLoading: false })
      } catch (error: any) {
        set({ 
          isLoading: false, 
          error: error.message || 'Failed to save file' 
        })
      }
    },

    saveAllTabs: async () => {
      const { tabs } = get()
      const dirtyTabs = tabs.filter(tab => tab.isDirty)
      
      for (const tab of dirtyTabs) {
        await get().saveTab(tab.id)
      }
    },

    markTabClean: (tabId: string) => {
      const { tabs } = get()
      
      const updatedTabs = tabs.map(tab =>
        tab.id === tabId ? { ...tab, isDirty: false } : tab
      )

      set({ tabs: updatedTabs })
    },

    setCursorPosition: (tabId: string, line: number, column: number) => {
      const { tabs } = get()
      
      const updatedTabs = tabs.map(tab =>
        tab.id === tabId 
          ? { ...tab, cursorPosition: { line, column } }
          : tab
      )

      set({ tabs: updatedTabs })
    },

    closeAllTabs: () => {
      set({
        tabs: [],
        activeTabId: null
      })
    },

    closeOtherTabs: (tabId: string) => {
      const { tabs } = get()
      const tabToKeep = tabs.find(tab => tab.id === tabId)
      
      if (tabToKeep) {
        set({
          tabs: [{ ...tabToKeep, isActive: true }],
          activeTabId: tabId
        })
      }
    },

    getActiveTab: () => {
      const { tabs, activeTabId } = get()
      return tabs.find(tab => tab.id === activeTabId) || null
    },

    getTabById: (tabId: string) => {
      const { tabs } = get()
      return tabs.find(tab => tab.id === tabId) || null
    }
  }))
)
