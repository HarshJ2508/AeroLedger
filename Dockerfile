# Stage 1: Base stage with common dependencies
FROM node:18-alpine AS base
WORKDIR /app

# Stage 2: Frontend dependencies
FROM base AS frontend-deps
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

# Stage 3: Backend dependencies
FROM base AS backend-deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install

# Stage 4: Development stage
FROM node:18-alpine
WORKDIR /app

# Copy dependencies from previous stages
COPY --from=frontend-deps /app/frontend/node_modules ./frontend/node_modules
COPY --from=backend-deps /app/backend/node_modules ./backend/node_modules

# Copy application code
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
COPY frontend ./frontend
COPY backend ./backend

# Use a .dockerignore file to exclude unnecessary files
# Set environment to development
ENV NODE_ENV=development

# Expose ports
EXPOSE 5173 3000

# Start the application
CMD ["sh", "-c", "npm run start --prefix /app/backend & cd /app/frontend && npm run dev"]