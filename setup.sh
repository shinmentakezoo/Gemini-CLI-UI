#!/bin/bash

# Gemini CLI UI Setup Script
# This script sets up the development environment for the Gemini CLI UI project

set -e

echo "🚀 Setting up Gemini CLI UI Development Environment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
        
        # Check if version is >= 18
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
            print_error "Node.js version 18 or higher is required. Current version: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Install root dependencies
install_root_deps() {
    print_status "Installing root dependencies..."
    npm install
    print_success "Root dependencies installed"
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    print_success "Frontend dependencies installed"
}

# Install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_success "Backend dependencies installed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    cd backend
    
    # Copy environment file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cp .env.example .env
        print_warning "Please edit backend/.env with your configuration"
    fi
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    
    # Push database schema
    print_status "Setting up database schema..."
    npx prisma db push
    
    cd ..
    print_success "Database setup completed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p backend/logs
    mkdir -p backend/uploads
    mkdir -p frontend/public/uploads
    
    print_success "Directories created"
}

# Setup Git hooks (optional)
setup_git_hooks() {
    if [ -d .git ]; then
        print_status "Setting up Git hooks..."
        
        # Create pre-commit hook
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."

# Run linting
npm run lint:frontend
npm run lint:backend

# Run tests
npm run test:frontend
npm run test:backend

echo "Pre-commit checks passed!"
EOF
        
        chmod +x .git/hooks/pre-commit
        print_success "Git hooks setup completed"
    fi
}

# Main setup function
main() {
    echo
    print_status "Starting setup process..."
    echo
    
    # Check prerequisites
    check_node
    check_npm
    
    echo
    print_status "Installing dependencies..."
    
    # Install dependencies
    install_root_deps
    install_frontend_deps
    install_backend_deps
    
    echo
    print_status "Setting up project..."
    
    # Setup project
    create_directories
    setup_database
    setup_git_hooks
    
    echo
    print_success "Setup completed successfully! 🎉"
    echo
    echo "Next steps:"
    echo "1. Edit backend/.env with your configuration (especially GEMINI_API_KEY)"
    echo "2. Run 'npm run dev' to start the development servers"
    echo "3. Open http://localhost:4009 in your browser"
    echo
    echo "Available commands:"
    echo "  npm run dev              - Start both frontend and backend"
    echo "  npm run dev:frontend     - Start only frontend"
    echo "  npm run dev:backend      - Start only backend"
    echo "  npm run build            - Build for production"
    echo "  npm run test             - Run tests"
    echo
    print_status "Happy coding! 🚀"
}

# Run main function
main
