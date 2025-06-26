# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy Angular CLI as it's needed for build
RUN npm install -g @angular/cli@19.2.7

# Copy source code
COPY . .

# Build the Angular app for production
RUN npm run build:prod

# Expose port
EXPOSE $PORT

# Start the application
CMD ["npm", "run", "start:prod"]
