# Base image with Node.js
FROM node:20 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including native modules)
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

# Install runtime dependencies (like tor)
RUN apt-get update && apt-get install -y \
    curl \
    tor \
    && rm -rf /var/lib/apt/lists/*

# Copy only the necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/server.js ./dist/server.js
COPY --from=builder /app/dashboard/dist ./dashboard/dist
COPY --from=builder /app/package.json ./package.json

# Start the server
CMD ["node", "dist/server.js"]
