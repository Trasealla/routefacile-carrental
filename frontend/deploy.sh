#!/bin/bash

# ARC Main Website Deployment Script
# This script handles the deployment process for the production server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Configuration
APP_NAME="ARC Main Website"
BUILD_DIR="build"
BACKUP_DIR="backups"
DEPLOY_DIR="/var/www/arc-website"  # Adjust this to your server's web root
NODE_VERSION="18"  # Specify required Node version

# Check if running as appropriate user
print_status "Starting deployment for $APP_NAME..."

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    print_status "Creating backup directory..."
    mkdir -p "$BACKUP_DIR"
fi

# Check Node.js version
print_status "Checking Node.js version..."
CURRENT_NODE=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$CURRENT_NODE" -lt "$NODE_VERSION" ]; then
    print_error "Node.js version $NODE_VERSION or higher is required. Current version: $(node -v)"
    exit 1
fi

# Pull latest changes from git
print_status "Pulling latest changes from repository..."
git pull origin frontend-master || {
    print_error "Failed to pull from repository. Please check your git credentials."
    exit 1
}

# Install/update dependencies
print_status "Installing dependencies..."
npm ci --production=false || {
    print_error "Failed to install dependencies"
    exit 1
}

# Run tests (optional - uncomment if you have tests)
# print_status "Running tests..."
# npm test -- --watchAll=false || {
#     print_error "Tests failed. Aborting deployment."
#     exit 1
# }

# Build the application
print_status "Building the application..."
npm run build || {
    print_error "Build failed"
    exit 1
}

# Check if build was successful
if [ ! -d "$BUILD_DIR" ]; then
    print_error "Build directory not found. Build may have failed."
    exit 1
fi

# Create backup of current deployment
if [ -d "$DEPLOY_DIR" ]; then
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_NAME="backup_$TIMESTAMP.tar.gz"
    
    print_status "Creating backup of current deployment..."
    tar -czf "$BACKUP_DIR/$BACKUP_NAME" -C "$(dirname "$DEPLOY_DIR")" "$(basename "$DEPLOY_DIR")" || {
        print_warning "Failed to create backup, continuing anyway..."
    }
    
    # Keep only last 5 backups
    print_status "Cleaning old backups..."
    cd "$BACKUP_DIR"
    ls -t backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
    cd - > /dev/null
fi

# Deploy new build
print_status "Deploying new build..."
if [ -d "$DEPLOY_DIR" ]; then
    # Remove old deployment
    rm -rf "$DEPLOY_DIR"/*
fi

# Create deployment directory if it doesn't exist
mkdir -p "$DEPLOY_DIR"

# Copy new build
cp -r "$BUILD_DIR"/* "$DEPLOY_DIR"/ || {
    print_error "Failed to copy build files"
    exit 1
}

# Set proper permissions
print_status "Setting permissions..."
find "$DEPLOY_DIR" -type d -exec chmod 755 {} \;
find "$DEPLOY_DIR" -type f -exec chmod 644 {} \;

# If using PM2 for process management (uncomment if needed)
# print_status "Restarting PM2 process..."
# pm2 restart arc-website || pm2 start ecosystem.config.js

# If using Nginx, reload configuration
if command -v nginx &> /dev/null; then
    print_status "Reloading Nginx configuration..."
    sudo nginx -t && sudo nginx -s reload || {
        print_warning "Failed to reload Nginx"
    }
fi

# Clear CDN cache if applicable (example for Cloudflare)
# if [ ! -z "$CLOUDFLARE_ZONE_ID" ] && [ ! -z "$CLOUDFLARE_API_TOKEN" ]; then
#     print_status "Purging CDN cache..."
#     curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
#          -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
#          -H "Content-Type: application/json" \
#          --data '{"purge_everything":true}'
# fi

print_status "Deployment completed successfully!"
print_status "Application deployed to: $DEPLOY_DIR"
print_status "Backup saved to: $BACKUP_DIR/$BACKUP_NAME"

# Optional: Run health check
# print_status "Running health check..."
# curl -f http://localhost:3000/health || {
#     print_error "Health check failed"
#     exit 1
# }

exit 0
