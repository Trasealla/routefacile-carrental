# Multi-stage build for React app
FROM node:20-slim AS builder

WORKDIR /usr/src/app

# Skip large optional binary downloads (Puppeteer Chromium ~170MB, Cypress, Playwright)
# These are dev/test tools not needed to build the React bundle.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_SKIP_DOWNLOAD=true \
    CYPRESS_INSTALL_BINARY=0 \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    HUSKY=0 \
    GENERATE_SOURCEMAP=false \
    NODE_OPTIONS=--max-old-space-size=4096

# Copy package files
COPY package*.json ./

# Install dependencies and clean caches in same layer to keep image small
RUN npm install --force --no-audit --no-fund \
    && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /usr/src/app/build /usr/share/nginx/html

# Copy nginx configuration from builder stage (it was copied in the builder stage)
COPY --from=builder /usr/src/app/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
