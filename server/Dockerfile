# ============================================================
# Stage 1: Builder — cài đủ deps và compile TypeScript
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files trước để tận dụng Docker layer cache
COPY package*.json ./

# Cài tất cả deps (bao gồm devDependencies để có TypeScript compiler)
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript → JavaScript
RUN npm run build

# ============================================================
# Stage 2: Production — chỉ giữ những gì cần để chạy
# ============================================================
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Chỉ cài production dependencies (không có devDependencies)
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled JS từ builder stage
COPY --from=builder /app/dist ./dist

# Security: chạy với non-root user
USER node

# Port mà Express sẽ lắng nghe
EXPOSE 4001

# Healthcheck để Render/Docker biết app đã sẵn sàng
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:4001/ || exit 1

# Lệnh khởi động production server
CMD ["node", "dist/index.js"]
