# ================================
# Frontend (React/Vite) Dockerfile
# ================================
# Two-stage build:
# Stage 1 — Build the React app with Node
# Stage 2 — Serve the static output with Nginx (no Node needed in production)

# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for layer caching
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build
# Output is in /app/dist

# ---- Stage 2: Serve ----
FROM nginx:alpine

# Copy the built React app into Nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom Nginx config (handles SPA routing + API proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
