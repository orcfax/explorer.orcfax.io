# Stage 1: Build the application
FROM node:20.13.1-bookworm-slim AS builder

# Set the working directory
WORKDIR /app

# Copy dependency definition files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm@8.12.1 \
    && pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Set Node.js memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the application
RUN pnpm run build

# Prune development dependencies
RUN pnpm prune --prod

# Stage 2: Create the production image
FROM node:20.13.1-bookworm-slim

# Set the working directory
WORKDIR /app

# Copy the build output and node_modules from the builder stage
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .

# Expose the application port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Define the command to run the application
CMD ["node", "build"]