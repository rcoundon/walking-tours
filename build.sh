#!/bin/bash

# Exit on error
set -e

echo "Starting build process..."

# Create dist directory
mkdir -p dist

# Copy HTML files
echo "Copying HTML files..."
cp index.html dist/
cp route-info.html dist/

# Replace API key placeholder in route.js and copy to dist
echo "Processing route.js with API key..."
if [ -z "$HERE_MAPS_API_KEY" ]; then
  echo "WARNING: HERE_MAPS_API_KEY environment variable is not set!"
  echo "Using placeholder value for local development."
  cp route.js dist/
else
  sed "s/HERE_MAPS_API_KEY/${HERE_MAPS_API_KEY}/g" route.js > dist/route.js
  echo "API key injected successfully."
fi

echo "Build completed! Files are in dist/"
