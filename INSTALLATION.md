# Gemini CLI UI - Installation Guide

This guide will help you set up the Gemini CLI UI development environment on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and **npm 9+**
- **Git**
- **Google Gemini API Key** (for AI features)

### Checking Prerequisites

```bash
# Check Node.js version
node --version  # Should be 18.0.0 or higher

# Check npm version
npm --version   # Should be 9.0.0 or higher

# Check Git
git --version
```

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Gemini-CLI-UI
```

### 2. Run Setup Script (Linux/Mac)

```bash
chmod +x setup.sh
./setup.sh
```

### 3. Manual Setup (Windows/Alternative)

If the setup script doesn't work, follow these manual steps:

#### Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

#### Setup Environment

```bash
# Copy environment template
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:

```env
# Required: Add your Gemini API key
GEMINI_API_KEY=your-gemini-api-key-here

# Optional: Customize other settings
PORT=4008
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL="file:./geminicliui_auth.db"
CORS_ORIGIN=http://localhost:4009
```

#### Setup Database

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Create database and tables
npx prisma db push

cd ..
```

### 4. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
npm run dev:frontend  # Frontend only (port 4009)
npm run dev:backend   # Backend only (port 4008)
```

### 5. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:4009
- **Backend API**: http://localhost:4008
- **Health Check**: http://localhost:4008/health

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env` file

## Development Commands

```bash
# Development
npm run dev                 # Start both frontend and backend
npm run dev:frontend        # Start frontend only
npm run dev:backend         # Start backend only

# Building
npm run build              # Build both for production
npm run build:frontend     # Build frontend only
npm run build:backend      # Build backend only

# Testing
npm run test               # Run all tests
npm run test:frontend      # Run frontend tests
npm run test:backend       # Run backend tests

# Linting
npm run lint:frontend      # Lint frontend code
npm run lint:backend       # Lint backend code

# Database
cd backend
npx prisma studio          # Open database browser
npx prisma db push         # Push schema changes
npx prisma generate        # Regenerate client
```

## Docker Setup (Alternative)

If you prefer using Docker:

```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Project Structure

```
Gemini-CLI-UI/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # Zustand stores
│   │   ├── services/      # API services
│   │   └── lib/           # Utilities
│   └── package.json
├── backend/               # Express + TypeScript backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Utilities
│   ├── prisma/            # Database schema
│   └── package.json
├── docker-compose.yml     # Docker configuration
└── package.json           # Root package.json
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill processes on ports 4008 and 4009
   npx kill-port 4008 4009
   ```

2. **Database connection issues**
   ```bash
   cd backend
   rm -f geminicliui_auth.db
   npx prisma db push
   ```

3. **Node modules issues**
   ```bash
   # Clean install
   rm -rf node_modules frontend/node_modules backend/node_modules
   npm run install:all
   ```

4. **Permission issues (Linux/Mac)**
   ```bash
   sudo chown -R $USER:$USER .
   ```

### Environment Variables

Make sure these environment variables are set in `backend/.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Your Google Gemini API key |
| `JWT_SECRET` | Yes | Secret for JWT token signing |
| `PORT` | No | Backend port (default: 4008) |
| `NODE_ENV` | No | Environment (development/production) |
| `DATABASE_URL` | No | Database connection string |
| `CORS_ORIGIN` | No | Frontend URL for CORS |

### Getting Help

If you encounter issues:

1. Check the console logs in your browser
2. Check the terminal output for error messages
3. Ensure all prerequisites are installed
4. Verify your `.env` configuration
5. Try restarting the development servers

## Next Steps

Once you have the application running:

1. **Create an account** on the login page
2. **Explore the IDE interface** with file explorer, editor, and terminal
3. **Try the AI features** by chatting with the Gemini assistant
4. **Open a project** and start coding
5. **Customize the IDE** to your preferences

## Production Deployment

For production deployment, see the [DEPLOYMENT.md](./DEPLOYMENT.md) guide.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines and how to contribute to the project.
