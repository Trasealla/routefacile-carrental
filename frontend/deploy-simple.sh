#!/bin/bash

# Simple deployment script for ARC Main Website
# Run this script on your production server

echo "Starting deployment..."

# Pull latest changes
echo "1. Pulling latest changes..."
git pull origin frontend-master

# Install dependencies
echo "2. Installing dependencies..."
npm ci

# Build the project
echo "3. Building the project..."
npm run build

# The build folder is now ready to be served
echo "Deployment complete! The build folder contains the production-ready files."
echo "Configure your web server (Apache/Nginx) to serve files from the ./build directory"
