#!/bin/bash

# Local development script
# Loads .env file and runs build + server

set -e

echo "🚀 Starting local development..."

# Check if .env exists
if [ -f .env ]; then
  echo "Loading environment variables from .env file..."
  export $(cat .env | grep -v '^#' | xargs)
else
  echo "⚠️  WARNING: No .env file found!"
  echo "Create a .env file with: HERE_MAPS_API_KEY=your-api-key"
  echo ""
fi

# Run build
echo "Building project..."
./build.sh

echo ""
echo "✅ Build complete!"
echo ""
echo "📂 Serving from dist/ folder on http://localhost:8000"
echo "Press Ctrl+C to stop"
echo ""

# Serve from dist
cd dist
python3 -m http.server 8000
