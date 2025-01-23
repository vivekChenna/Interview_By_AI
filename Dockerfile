# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port (change the port if necessary)
EXPOSE 9056


# Command to run the application
CMD ["npm", "run", "dev", "--", "--port", "9056"]
