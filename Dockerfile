# Base image with Node.js
FROM node:20 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including native modules for build-time)
RUN npm install

# Copy dashboard code and build it
COPY dashboard ./dashboard
WORKDIR /app/dashboard
RUN npm install
RUN npm run build

# Copy server code and bundle it
WORKDIR /app
COPY src ./src
COPY lib ./lib
COPY api_*.cjs ./
COPY .env ./
RUN npm run build:bundle

# Production image
FROM node:20

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    tor \
    && rm -rf /var/lib/apt/lists/*

# Copy root package files
COPY package*.json ./

# Install production dependencies only (will build native modules for better-sqlite3)
RUN npm install --omit=dev

# Copy built dashboard and bundled server
COPY --from=builder /app/dist/server.js ./dist/server.js
COPY --from=builder /app/dashboard/dist ./dashboard/dist

# Debug: list better-sqlite3 content to verify bindings
RUN find node_modules/better-sqlite3 -name "*.node"

# Start the server
CMD ["node", "dist/server.js"]
