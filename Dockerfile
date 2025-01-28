# Build Stage
FROM node:18-alpine as build

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies)
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Production Stage
FROM node:18-alpine

# Install a lightweight static file server
RUN npm install -g serve

# Copy the build output from the previous stage
COPY --from=build /app/dist /app/dist

# Expose the port
EXPOSE 9056

# Command to serve the application
CMD ["serve", "-s", "/app/dist", "-l", "9056"]
