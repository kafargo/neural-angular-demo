# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy root package.json
COPY package*.json ./

# Copy the Angular app directory
COPY neural-angular-demo/ ./neural-angular-demo/

# Set working directory to the Angular app
WORKDIR /app/neural-angular-demo

# Install dependencies
RUN npm ci

# Build the Angular app for production
RUN npm run build:prod

# Expose port
EXPOSE $PORT

# Start the application
CMD ["npm", "run", "start:prod"]
