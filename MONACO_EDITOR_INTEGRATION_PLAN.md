# Monaco Editor Integration Plan

## Overview

This document outlines the detailed plan for migrating from CodeMirror to Monaco Editor in the Gemini-CLI-UI project. Monaco Editor is the code editor that powers VS Code, providing advanced features like IntelliSense, multi-cursor support, and extensive language support.

## Migration Goals

1. **Feature Parity**: Maintain all existing CodeMirror functionality
2. **Enhanced Features**: Add VS Code-like capabilities
3. **Performance**: Ensure smooth performance for large files
4. **Compatibility**: Maintain existing file operations and integrations
5. **User Experience**: Seamless transition for existing users

## Current CodeMirror Implementation Analysis

### Existing Features to Preserve
- Syntax highlighting for multiple languages
- Basic code editing functionality
- File save/load operations
- Theme support
- Integration with file explorer
- Real-time collaboration features (if any)

### Integration Points to Update
- File system service connections
- Git integration for file changes
- AI chat context sharing
- Session state persistence
- Keyboard shortcuts
- User preferences

## Monaco Editor Architecture

### Core Components

```typescript
// Monaco Editor Configuration
interface MonacoEditorConfig {
  // Editor Options
  theme: 'vs-dark' | 'vs-light' | 'custom-theme'
  fontSize: number
  fontFamily: string
  lineNumbers: 'on' | 'off' | 'relative'
  minimap: {
    enabled: boolean
    maxColumn: number
    renderCharacters: boolean
  }
  
  // Language Features
  suggest: {
    showMethods: boolean
    showFunctions: boolean
    showConstructors: boolean
    showFields: boolean
    showVariables: boolean
    showClasses: boolean
    showStructs: boolean
    showInterfaces: boolean
    showModules: boolean
    showProperties: boolean
    showEvents: boolean
    showOperators: boolean
    showUnits: boolean
    showValues: boolean
    showConstants: boolean
    showEnums: boolean
    showEnumMembers: boolean
    showKeywords: boolean
    showWords: boolean
    showColors: boolean
    showFiles: boolean
    showReferences: boolean
    showFolders: boolean
    showTypeParameters: boolean
    showSnippets: boolean
  }
  
  // Editor Features
  folding: boolean
  wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded'
  scrollBeyondLastLine: boolean
  smoothScrolling: boolean
  cursorBlinking: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid'
  mouseWheelZoom: boolean
  
  // Performance
  largeFileOptimizations: boolean
  maxTokenizationLineLength: number
  stopRenderingLineAfter: number
}
```

### Component Structure

```typescript
// Main Editor Component
interface MonacoEditorComponent {
  // Core Properties
  editor: monaco.editor.IStandaloneCodeEditor
  model: monaco.editor.ITextModel
  viewState: monaco.editor.ICodeEditorViewState | null
  
  // Methods
  initialize(container: HTMLElement, options: MonacoEditorConfig): void
  loadFile(filePath: string, content: string, language: string): void
  saveFile(): Promise<void>
  dispose(): void
  
  // Event Handlers
  onDidChangeContent: (callback: (e: monaco.editor.IModelContentChangedEvent) => void) => void
  onDidChangeCursorPosition: (callback: (e: monaco.editor.ICursorPositionChangedEvent) => void) => void
  onDidFocusEditorText: (callback: () => void) => void
  onDidBlurEditorText: (callback: () => void) => void
}

// Editor Service
interface EditorService {
  // Editor Management
  createEditor(containerId: string, options?: Partial<MonacoEditorConfig>): MonacoEditorComponent
  getActiveEditor(): MonacoEditorComponent | null
  getAllEditors(): MonacoEditorComponent[]
  closeEditor(editorId: string): void
  
  // File Operations
  openFile(filePath: string): Promise<void>
  saveFile(editorId: string): Promise<void>
  saveAllFiles(): Promise<void>
  
  // Language Support
  registerLanguageProvider(language: string, provider: LanguageProvider): void
  setModelLanguage(editorId: string, language: string): void
  
  // Theme Management
  defineTheme(themeName: string, themeData: monaco.editor.IStandaloneThemeData): void
  setTheme(themeName: string): void
}
```

## Implementation Plan

### Phase 1: Setup and Basic Integration (Week 1)

#### 1.1 Dependencies and Setup
```json
{
  "dependencies": {
    "monaco-editor": "^0.45.0",
    "@monaco-editor/react": "^4.6.0",
    "monaco-editor-webpack-plugin": "^7.1.0"
  }
}
```

#### 1.2 Webpack Configuration
```javascript
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  plugins: [
    new MonacoWebpackPlugin({
      languages: [
        'javascript', 'typescript', 'python', 'java', 
        'cpp', 'csharp', 'go', 'rust', 'php', 'ruby',
        'html', 'css', 'json', 'markdown', 'yaml', 'xml'
      ],
      features: [
        'accessibilityHelp', 'anchorSelect', 'bracketMatching',
        'caretOperations', 'clipboard', 'codeAction', 'codelens',
        'colorPicker', 'comment', 'contextmenu', 'coreCommands',
        'cursorUndo', 'dnd', 'documentSymbols', 'find', 'folding',
        'fontZoom', 'format', 'gotoError', 'gotoLine', 'gotoSymbol',
        'hover', 'inPlaceReplace', 'indentation', 'inlineHints',
        'inspectTokens', 'linesOperations', 'linkedEditing', 'links',
        'multicursor', 'parameterHints', 'quickCommand', 'quickHelp',
        'quickOutline', 'referenceSearch', 'rename', 'smartSelect',
        'snippets', 'suggest', 'toggleHighContrast', 'toggleTabFocusMode',
        'transpose', 'unusualLineTerminators', 'viewportSemanticTokens',
        'wordHighlighter', 'wordOperations', 'wordPartOperations'
      ]
    })
  ]
};
```

#### 1.3 Basic Editor Component
```typescript
import React, { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import { useEditorStore } from '@/stores/editorStore';

interface MonacoEditorProps {
  filePath: string;
  initialContent: string;
  language: string;
  theme?: string;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  filePath,
  initialContent,
  language,
  theme = 'vs-dark',
  options = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { updateFileContent, registerEditor } = useEditorStore();

  useEffect(() => {
    if (!containerRef.current) return;

    // Create editor
    const editor = monaco.editor.create(containerRef.current, {
      value: initialContent,
      language,
      theme,
      automaticLayout: true,
      minimap: { enabled: true },
      fontSize: 14,
      fontFamily: 'Fira Code, monospace',
      fontLigatures: true,
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      ...options
    });

    editorRef.current = editor;
    registerEditor(filePath, editor);

    // Setup change listener
    const changeDisposable = editor.onDidChangeModelContent(() => {
      const content = editor.getValue();
      updateFileContent(filePath, content);
    });

    // Cleanup
    return () => {
      changeDisposable.dispose();
      editor.dispose();
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};
```

### Phase 2: Advanced Features (Week 2)

#### 2.1 Multi-Tab Support
```typescript
interface TabManager {
  tabs: Map<string, TabInfo>;
  activeTabId: string | null;
  
  openTab(filePath: string, content: string): void;
  closeTab(tabId: string): void;
  switchTab(tabId: string): void;
  updateTabContent(tabId: string, content: string): void;
  reorderTabs(fromIndex: number, toIndex: number): void;
}

interface TabInfo {
  id: string;
  filePath: string;
  title: string;
  isDirty: boolean;
  editor: monaco.editor.IStandaloneCodeEditor;
  viewState: monaco.editor.ICodeEditorViewState | null;
}
```

#### 2.2 IntelliSense Integration
```typescript
// TypeScript/JavaScript Language Service
monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.Latest,
  allowNonTsExtensions: true,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  module: monaco.languages.typescript.ModuleKind.CommonJS,
  noEmit: true,
  esModuleInterop: true,
  jsx: monaco.languages.typescript.JsxEmit.React,
  reactNamespace: 'React',
  allowJs: true,
  typeRoots: ['node_modules/@types']
});

// Add type definitions
monaco.languages.typescript.javascriptDefaults.addExtraLib(
  `declare module 'react' { export = React; }`,
  'file:///node_modules/@types/react/index.d.ts'
);