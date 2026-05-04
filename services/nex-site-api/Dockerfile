# ============================================
# NestJS Backend - Production Dockerfile
# ============================================

# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: Production ---
FROM node:20-alpine AS production

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built files
COPY --from=builder /app/dist ./dist

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001
USER nestjs

EXPOSE 8103

CMD ["node", "dist/main"]
