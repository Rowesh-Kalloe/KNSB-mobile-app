#!/bin/bash

echo "🚀 Setting up KNSB Mobile App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📱 Installing Expo CLI..."
    npm install -g @expo/cli
fi

echo "✅ Expo CLI version: $(expo --version)"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    echo "EXPO_PUBLIC_PROXY_URL=http://localhost:8088" > .env
fi

echo "🎉 Setup complete! You can now run:"
echo "  npm run dev        # Start the development server"
echo "  npm run dev:proxy  # Start the CORS proxy server"
echo "  npm run dev:all    # Start both servers"
