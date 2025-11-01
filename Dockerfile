# Stage 1: Build the application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package configuration and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the application. Vite will automatically use build-time environment variables.
# We will set these in the Cloud Run configuration later.
RUN npm run build

# Stage 2: Serve the application from a lightweight server
FROM node:18-alpine

WORKDIR /app

# Install 'serve', a static file server
RUN npm install -g serve

# Copy the built application from the build stage
COPY --from=build /app/dist ./dist

# Expose the port that Cloud Run will use
EXPOSE 8080

# Start the server. 'serve' will listen on the port defined by the PORT env var,
# which is automatically provided by Cloud Run. The -s flag is important for SPAs.
CMD ["serve", "-s", "dist"]
