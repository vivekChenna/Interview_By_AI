# Stage 1: Build React App using Node 18 Alpine
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies


RUN npm install --frozen-lockfile



# Copy the rest of the application files
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve the React App using Nginx
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

# Copy the built React app from the build stage
COPY --from=build /app/build .

# COPY the custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 9084

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]