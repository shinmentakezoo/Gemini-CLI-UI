import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

export function getFileName(path: string): string {
  return path.split('/').pop() || path
}

export function getFileIcon(filename: string): string {
  const ext = getFileExtension(filename).toLowerCase()
  
  const iconMap: Record<string, string> = {
    // Programming languages
    js: '🟨',
    ts: '🔷',
    jsx: '⚛️',
    tsx: '⚛️',
    py: '🐍',
    java: '☕',
    cpp: '⚙️',
    c: '⚙️',
    h: '📄',
    cs: '🔷',
    php: '🐘',
    rb: '💎',
    go: '🐹',
    rs: '🦀',
    swift: '🦉',
    kt: '🎯',
    
    // Web technologies
    html: '🌐',
    css: '🎨',
    scss: '🎨',
    sass: '🎨',
    less: '🎨',
    
    // Data formats
    json: '📋',
    xml: '📄',
    yaml: '📄',
    yml: '📄',
    toml: '📄',
    ini: '⚙️',
    
    // Documentation
    md: '📝',
    txt: '📄',
    pdf: '📕',
    doc: '📘',
    docx: '📘',
    
    // Images
    png: '🖼️',
    jpg: '🖼️',
    jpeg: '🖼️',
    gif: '🖼️',
    svg: '🎨',
    ico: '🖼️',
    
    // Archives
    zip: '📦',
    tar: '📦',
    gz: '📦',
    rar: '📦',
    
    // Others
    gitignore: '🚫',
    dockerfile: '🐳',
    makefile: '🔨',
  }
  
  return iconMap[ext] || '📄'
}

export function isImageFile(filename: string): boolean {
  const ext = getFileExtension(filename).toLowerCase()
  return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)
}

export function isTextFile(filename: string): boolean {
  const ext = getFileExtension(filename).toLowerCase()
  const textExtensions = [
    'txt', 'md', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf',
    'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'php',
    'rb', 'go', 'rs', 'swift', 'kt', 'html', 'css', 'scss', 'sass', 'less',
    'sql', 'sh', 'bat', 'ps1', 'dockerfile', 'makefile', 'gitignore'
  ]
  return textExtensions.includes(ext) || !ext
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err)
    }
    document.body.removeChild(textArea)
    return Promise.resolve()
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
