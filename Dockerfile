# -------------------------------------------------
# 1️⃣ Build stage – install deps and compile assets
# -------------------------------------------------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install only package.json first (caches layers)
COPY package*.json ./
RUN npm ci --silent

# Copy source code and build
COPY . .
RUN npm run build   # Vite will output to /app/dist

# -------------------------------------------------
# 2️⃣ Runtime stage – serve the built app
# -------------------------------------------------
FROM nginx:stable-alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: expose a custom port (default 80)
EXPOSE 80

# Use the default nginx command
CMD ["nginx", "-g", "daemon off;"]