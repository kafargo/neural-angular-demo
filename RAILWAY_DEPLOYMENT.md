# Railway Deployment Guide

This guide will help you deploy the Neural Network Angular Demo to Railway.

## Prerequisites

- Railway account (sign up at [railway.app](https://railway.app))
- Git repository with your code
- Railway CLI (optional, but recommended)

## Deployment Methods

### Method 1: Using Railway's GitHub Integration (Recommended)

1. **Push your code to GitHub**

   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. **Connect to Railway**

   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure the deployment**

   - Railway will automatically detect this as a Node.js project
   - The `railway.json` configuration will be used automatically
   - Environment variables will be set from the production environment file

4. **Deploy**
   - Railway will automatically build and deploy your application
   - The build process will run `npm run build:prod`
   - The application will start with `npm run start:prod`

### Method 2: Using Railway CLI

1. **Install Railway CLI**

   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**

   ```bash
   railway login
   ```

3. **Initialize Railway project**

   ```bash
   railway init
   ```

4. **Deploy**
   ```bash
   railway up
   ```

## Environment Configuration

The application is configured to work with different environments:

- **Development**: Uses `http://localhost:8000` for the backend API
- **Production**: Uses `https://neural-network-intro-production.up.railway.app` for the backend API

These are automatically configured in the environment files and will be used based on the build configuration.

## Build Process

The Railway deployment follows this process:

1. **Install dependencies**: `npm ci`
2. **Build Angular app**: `npm run build:prod`
3. **Start Express server**: `npm run start:prod`

The Express server (`server.js`) serves the built Angular application and handles routing for the single-page application.

## Post-Deployment

After successful deployment:

1. **Access your application** at the Railway-provided URL
2. **Test the connection** to ensure the app can communicate with the backend API
3. **Monitor logs** in the Railway dashboard for any issues

## Troubleshooting

### Common Issues

1. **Build fails**

   - Ensure all dependencies are in `package.json`
   - Check that Angular CLI version is compatible

2. **App won't start**

   - Verify the `start:prod` script in `package.json`
   - Check that `server.js` is present and correctly configured

3. **API connection issues**
   - Verify the backend API URL in `environment.prod.ts`
   - Check CORS configuration on the backend

### Checking Logs

```bash
# Using Railway CLI
railway logs

# Or check logs in the Railway dashboard
```

## Configuration Files

The following files have been added/modified for Railway deployment:

- `railway.json` - Railway-specific configuration
- `server.js` - Express server to serve the Angular app
- `Dockerfile` - Docker configuration (alternative deployment method)
- `Procfile` - Process configuration
- `src/environments/environment.ts` - Development environment
- `src/environments/environment.prod.ts` - Production environment
- `package.json` - Updated with production scripts and dependencies

## Support

If you encounter issues during deployment:

1. Check the Railway documentation at [docs.railway.app](https://docs.railway.app)
2. Review the Railway logs for error messages
3. Ensure your backend API is accessible and CORS is properly configured
