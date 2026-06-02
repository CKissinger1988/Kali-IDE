# Base image with Node.js
FROM node:20-slim AS builder

WORKDIR /app

# Install build essentials for native modules (e.g., better-sqlite3)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy root package files
COPY package*.json ./

# Install root dependencies
RUN npm install

# Copy dashboard code
COPY dashboard ./dashboard

# Build dashboard
WORKDIR /app/dashboard
RUN npm install
RUN npm run build

# Copy server code
WORKDIR /app
COPY src ./src
COPY lib ./lib
COPY api_*.cjs ./
COPY .env ./

# Bundle server
RUN npm run build:bundle

# Production image
FROM node:20-slim

WORKDIR /app

# Install dependencies needed for the server
RUN apt-get update && apt-get install -y \
    curl \
    tor \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and install production dependencies
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy bundled server and built dashboard
COPY --from=builder /app/dist/server.js ./dist/server.js
COPY --from=builder /app/dashboard/dist ./dashboard/dist

# Start the server
CMD ["node", "dist/server.js"]
