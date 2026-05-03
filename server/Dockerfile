# ================================
# Backend (Node.js) Dockerfile
# ================================

# Use Node 20 LTS Alpine — small and fast
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first (layer caching — only reinstalls if package.json changes)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy all server source files
COPY . .

# Expose the API port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
