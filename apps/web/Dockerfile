# Development Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/ui/package*.json ./packages/ui/
RUN npm install

# Copy source code
COPY tsconfig.base.json ./
COPY apps/web ./apps/web
COPY packages ./packages

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build

# Start Expo
WORKDIR /app/apps/web
EXPOSE 8081
CMD ["npx", "expo", "start", "--web", "--port", "8081"]
