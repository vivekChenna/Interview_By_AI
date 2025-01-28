# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Use a lightweight static file server to serve the build
RUN npm install -g serve

# Expose the port
EXPOSE 9056

# Command to serve the application
CMD ["serve", "-s", "dist", "-l", "9056"]
