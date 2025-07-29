import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/authStore'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: { email: string; password: string; name: string }) =>
    api.post('/auth/register', userData),
  
  logout: () => api.post('/auth/logout'),
  
  me: () => api.get('/auth/me'),
  
  refreshToken: () => api.post('/auth/refresh'),
}

// Files API
export const filesApi = {
  getFiles: (path: string = '') =>
    api.get(`/files?path=${encodeURIComponent(path)}`),
  
  getFile: (path: string) =>
    api.get(`/files/content?path=${encodeURIComponent(path)}`),
  
  saveFile: (path: string, content: string) =>
    api.post('/files/save', { path, content }),
  
  createFile: (path: string, content: string = '') =>
    api.post('/files/create', { path, content }),
  
  createFolder: (path: string) =>
    api.post('/files/folder', { path }),
  
  deleteFile: (path: string) =>
    api.delete(`/files?path=${encodeURIComponent(path)}`),
  
  renameFile: (oldPath: string, newPath: string) =>
    api.patch('/files/rename', { oldPath, newPath }),
  
  uploadFile: (formData: FormData) =>
    api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  search: (query: string, path: string = '') =>
    api.get(`/files/search?q=${encodeURIComponent(query)}&path=${encodeURIComponent(path)}`),
}

// Projects API
export const projectsApi = {
  getProjects: () => api.get('/projects'),
  
  getProject: (id: string) => api.get(`/projects/${id}`),
  
  createProject: (data: { name: string; description?: string; template?: string }) =>
    api.post('/projects', data),
  
  updateProject: (id: string, data: Partial<{ name: string; description: string }>) =>
    api.patch(`/projects/${id}`, data),
  
  deleteProject: (id: string) => api.delete(`/projects/${id}`),
  
  openProject: (id: string) => api.post(`/projects/${id}/open`),
  
  closeProject: (id: string) => api.post(`/projects/${id}/close`),
}

// Gemini API
export const geminiApi = {
  chat: (message: string, context?: any) =>
    api.post('/gemini/chat', { message, context }),
  
  generateCode: (prompt: string, language: string, context?: any) =>
    api.post('/gemini/generate', { prompt, language, context }),
  
  explainCode: (code: string, language: string) =>
    api.post('/gemini/explain', { code, language }),
  
  reviewCode: (code: string, language: string) =>
    api.post('/gemini/review', { code, language }),
  
  refactorCode: (code: string, language: string, instructions?: string) =>
    api.post('/gemini/refactor', { code, language, instructions }),
  
  getModels: () => api.get('/gemini/models'),
  
  getUsage: () => api.get('/gemini/usage'),
}

// Terminal API
export const terminalApi = {
  createSession: (options?: { shell?: string; cwd?: string }) =>
    api.post('/terminal/session', options),
  
  getSessions: () => api.get('/terminal/sessions'),
  
  getSession: (id: string) => api.get(`/terminal/sessions/${id}`),
  
  executeCommand: (sessionId: string, command: string) =>
    api.post(`/terminal/sessions/${sessionId}/execute`, { command }),
  
  resizeTerminal: (sessionId: string, cols: number, rows: number) =>
    api.post(`/terminal/sessions/${sessionId}/resize`, { cols, rows }),
  
  killSession: (sessionId: string) => api.delete(`/terminal/sessions/${sessionId}`),
}

// Git API
export const gitApi = {
  getStatus: (projectPath: string) =>
    api.get(`/git/status?path=${encodeURIComponent(projectPath)}`),
  
  getLog: (projectPath: string, limit: number = 20) =>
    api.get(`/git/log?path=${encodeURIComponent(projectPath)}&limit=${limit}`),
  
  getBranches: (projectPath: string) =>
    api.get(`/git/branches?path=${encodeURIComponent(projectPath)}`),
  
  createBranch: (projectPath: string, branchName: string) =>
    api.post('/git/branch', { path: projectPath, branchName }),
  
  switchBranch: (projectPath: string, branchName: string) =>
    api.post('/git/checkout', { path: projectPath, branchName }),
  
  stageFiles: (projectPath: string, files: string[]) =>
    api.post('/git/stage', { path: projectPath, files }),
  
  commit: (projectPath: string, message: string, files?: string[]) =>
    api.post('/git/commit', { path: projectPath, message, files }),
  
  push: (projectPath: string, remote: string = 'origin', branch?: string) =>
    api.post('/git/push', { path: projectPath, remote, branch }),
  
  pull: (projectPath: string, remote: string = 'origin', branch?: string) =>
    api.post('/git/pull', { path: projectPath, remote, branch }),
  
  clone: (url: string, path: string) =>
    api.post('/git/clone', { url, path }),
  
  getDiff: (projectPath: string, file?: string) =>
    api.get(`/git/diff?path=${encodeURIComponent(projectPath)}${file ? `&file=${encodeURIComponent(file)}` : ''}`),
}

export default api
