#!/bin/bash

# VeriHealth Public Site - Install and Run Script

echo "🚀 VeriHealth Public Site Setup"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the public-site directory:"
    echo "  cd public-site"
    echo "  bash install-and-run.sh"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🌐 Starting development server..."
    echo "   Public site will be available at: http://localhost:5001"
    echo "   Press Ctrl+C to stop"
    echo ""
    npm run dev
else
    echo ""
    echo "❌ Installation failed!"
    echo "Please check the error messages above."
    exit 1
fi
