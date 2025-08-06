# BoxCric Render Deployment Guide

## Backend Deployment on Render

This guide provides instructions for deploying the BoxCric backend API on Render.

### Prerequisites

- A Render account
- Your MongoDB Atlas connection string
- Cashfree API credentials

### Deployment Steps

1. **Create a new Web Service on Render**
   - Sign in to your Render account
   - Click "New" and select "Web Service"
   - Connect your GitHub repository

2. **Configure the Web Service**
   - Name: `boxcric-api` (or your preferred name)
   - Environment: `Node`
   - Region: Choose the closest to your users
   - Branch: `main` (or your deployment branch)
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Set Environment Variables**
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render will automatically set this, but you can specify it)
   - `FRONTEND_URL`: `https://boxcric.netlify.app`
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `JWT_EXPIRES_IN`: `7d`
   - `CASHFREE_APP_ID`: Your Cashfree App ID
   - `CASHFREE_SECRET_KEY`: Your Cashfree Secret Key
   - `CASHFREE_API_URL`: `https://api.cashfree.com/pg`

4. **Configure Health Check**
   - Under "Advanced" settings
   - Set Health Check Path to: `/api/health`

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your application

### Troubleshooting

If your deployment gets stuck at "Building" or "Deploying":

1. **Check Logs**
   - Go to the "Events" tab in your Render dashboard
   - Look for error messages in the build or deploy logs

2. **Common Issues**
   - **Port Configuration**: Ensure your app listens on the port specified by the `PORT` environment variable
   - **Missing Environment Variables**: Verify all required environment variables are set
   - **Node.js Version**: Make sure the Node.js version is compatible (we've specified v18.x in package.json)
   - **Health Check**: Ensure the health check endpoint is responding correctly

3. **File Case Sensitivity**
   - Render runs on Linux which is case-sensitive
   - Check for any file imports where the case might be different from the actual filename

### Monitoring

Once deployed, you can monitor your application:

- View logs in the "Logs" tab
- Set up alerts for when your service goes down
- Monitor resource usage in the "Metrics" tab