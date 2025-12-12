# Development Dockerfile
FROM node:20-alpine AS base

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/
RUN npm install

# Copy source code
COPY tsconfig.base.json ./
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build

# Start API
WORKDIR /app/apps/api
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Production build
FROM base AS production

WORKDIR /app/apps/api
RUN npm run build

CMD ["npm", "run", "start:prod"]
