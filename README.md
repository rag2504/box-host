# BoxCric - Box Cricket Booking Platform

A full-stack application for booking box cricket grounds, managing bookings, and processing payments.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT
- **Payment Gateway**: Cashfree
- **Real-time Updates**: Socket.IO

## Deployment Guide

This application is set up for deployment on Render (backend) and Netlify (frontend). The backend and frontend must be deployed separately.

### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following settings:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (IMPORTANT: Make sure it's `npm start`, not `npm run dev`)
   - **Health Check Path**: `/api/health`

4. Set up the following environment variables in Render:
   - `NODE_ENV`: production
   - `RENDER`: true
   - `PORT`: 3001
   - `FRONTEND_URL`: https://boxcric.netlify.app
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `JWT_EXPIRES_IN`: 7d
   - `CASHFREE_APP_ID`: Your Cashfree App ID
   - `CASHFREE_SECRET_KEY`: Your Cashfree Secret Key
   - `CASHFREE_API_URL`: https://api.cashfree.com/pg
   - `EMAIL_HOST`: smtp.gmail.com
   - `EMAIL_PORT`: 587
   - `EMAIL_USER`: Your email address
   - `EMAIL_PASS`: Your email app password
   - `EMAIL_FROM`: BoxCric <your-email@example.com>

5. Deploy the service

### Troubleshooting Render Deployment

If your Render deployment is running in development mode instead of production mode, you can fix it by:

1. Run the fix script: `node fix-render-start-command.js`
2. Commit and push the changes to GitHub
3. Manually trigger a new deployment in the Render dashboard
4. Check the logs to ensure it's running in production mode

### Frontend Deployment (Netlify)

1. Create a new site on Netlify
2. Connect your GitHub repository
3. Configure the following settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

4. Set up the following environment variables in Netlify:
   - `VITE_API_URL`: https://boxcric-api.onrender.com/api

5. Deploy the site

### Troubleshooting Netlify Deployment

If your Netlify deployment is not connecting to the backend correctly, you can fix it by:

1. Make sure your backend is deployed and running correctly on Render
2. Run the fix script: `node deploy-to-netlify.js`
3. This script will:
   - Update your `.env.production` file with the correct API URL
   - Verify your `netlify.toml` configuration
   - Build the frontend
   - Provide instructions for deploying to Netlify
4. After deployment, check the browser console for any API connection errors

### Important Notes

- The backend and frontend must be deployed separately
- The backend must be deployed first, as the frontend needs the backend URL
- Make sure the backend is running in production mode on Render
- The frontend expects the backend API at `https://boxcric-api.onrender.com/api`

## Local Development

### Prerequisites

- Node.js (v20.x)
- npm
- MongoDB Atlas account

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/boxcric.git
   cd boxcric
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # Server
   PORT=3001
   FRONTEND_URL=http://localhost:8080
   NODE_ENV=development
   
   # JWT
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=BoxCric <your_email@gmail.com>
   
   # Cashfree
   CASHFREE_APP_ID=your_cashfree_app_id
   CASHFREE_SECRET_KEY=your_cashfree_secret_key
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

## Testing Deployment

To test if your deployment configuration works correctly:

```bash
npm run test:render
```

This will simulate the Render environment and start the server locally.

## Troubleshooting Deployment Issues

### Backend Issues

1. **Connection Errors**: Check if your MongoDB connection string is correct and the IP is whitelisted.
2. **CORS Errors**: Ensure the frontend URL is correctly set in the CORS configuration.
3. **Email Errors**: Verify your email credentials and ensure less secure apps are allowed or an app password is used.

### Frontend Issues

1. **API Connection Errors**: Check if the API URL is correctly set in the environment variables.
2. **404 Errors**: Ensure the Netlify redirects are correctly configured in the netlify.toml file.

## License

MIT