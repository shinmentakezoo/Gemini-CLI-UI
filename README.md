# Gemini CLI UI - Advanced Web-Based IDE

A modern, feature-rich web-based IDE with AI-powered code generation using Google's Gemini CLI integration.

## Features

### 🚀 Core IDE Features
- **Monaco Editor**: VS Code's powerful editor with syntax highlighting
- **Multi-tab Interface**: Work with multiple files simultaneously
- **Integrated Terminal**: xterm.js-powered terminal with multiple sessions
- **File Explorer**: Drag-drop file operations with context menus
- **Global Search**: Find and replace across your entire project
- **Command Palette**: Quick access to all IDE commands

### 🤖 AI-Powered Development
- **Gemini Integration**: AI-powered code generation and assistance
- **Intelligent Chat**: Context-aware AI conversations about your code
- **Code Suggestions**: Real-time AI-powered code completions
- **Project Analysis**: AI-driven insights and recommendations

### 🛠️ Developer Tools
- **IntelliSense**: Advanced code completion and error detection
- **Debugging Support**: Integrated debugging with breakpoints
- **Git Integration**: Built-in version control operations
- **Language Servers**: Support for multiple programming languages
- **Extension System**: Extensible architecture for custom plugins

### 🎨 User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Customizable Themes**: Multiple color schemes and layouts
- **Keyboard Shortcuts**: VS Code-compatible key bindings
- **Real-time Collaboration**: WebSocket-powered live editing
- **Progressive Web App**: Install and use offline

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Monaco Editor** for code editing
- **xterm.js** for terminal emulation
- **Zustand** for state management
- **Tailwind CSS** + **Shadcn/ui** for styling
- **React Query** for data fetching

### Backend
- **Express.js** with TypeScript
- **WebSocket** for real-time communication
- **SQLite** for user authentication and sessions
- **Prisma** for database ORM
- **JWT** for authentication
- **Node.js** file system operations

### AI Integration
- **Google Gemini CLI** for AI capabilities
- **Gemini 2.5 Pro** model for code generation
- **Context-aware prompting** for better AI responses

## Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Git
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Gemini-CLI-UI
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:4009
   - Backend API: http://localhost:4008

## Development

### Project Structure
```
Gemini-CLI-UI/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── stores/        # Zustand stores
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   ├── public/        # Static assets
│   └── package.json
├── backend/           # Express + WebSocket backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Database models
│   │   └── utils/         # Utility functions
│   ├── prisma/        # Database schema
│   └── package.json
├── shared/            # Shared types and utilities
└── docs/              # Documentation
```

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run test` - Run tests for both frontend and backend
- `npm run install:all` - Install dependencies for all packages

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=4008
NODE_ENV=development

# Database
DATABASE_URL="file:./geminicliui_auth.db"

# Authentication
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d

# Gemini API
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-pro

# File System
PROJECTS_DIR=~/.gemini/projects
MAX_FILE_SIZE=10MB
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Monaco Editor team for the excellent code editor
- Google for the Gemini AI capabilities
- VS Code team for inspiration and design patterns
- Open source community for the amazing tools and libraries
