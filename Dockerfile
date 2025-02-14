# Stage 1: Build the Vite React App
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy project files
COPY . .

# Build the Vite app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy the built app from the "builder" stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for serving the app
EXPOSE 9084

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]