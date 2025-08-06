# Render Deployment Guide for BoxCric API

## Recent Fixes Applied

1. **Server Binding Fix**: Modified `server/index.js` to always bind to `0.0.0.0` regardless of environment, ensuring proper network binding on Render.

2. **Environment Variable Addition**: Added `RENDER: true` environment variable in `render.yaml` to explicitly identify the Render environment.

3. **Debug Logging**: Added additional debug logging to help diagnose any future deployment issues.

## Deployment Steps

1. **Commit and Push Changes**: Ensure all changes are committed and pushed to your GitHub repository.

   ```bash
   git add .
   git commit -m "Fix Render deployment with proper host binding"
   git push
   ```

2. **Trigger New Deployment**: In the Render dashboard, navigate to your service and click "Manual Deploy" > "Deploy latest commit".

3. **Monitor Logs**: Watch the deployment logs for any errors. The additional debug logging should help identify any issues.

## Common Deployment Issues

### 1. Node.js Version

Your project is using Node.js 18.x which has reached end-of-life. Consider upgrading to a maintained version:

1. Update the `engines` field in `package.json`:
   ```json
   "engines": {
     "node": "20.x"
   }
   ```

### 2. Health Check Failures

If the health check at `/api/health` fails:

- Ensure the route is correctly implemented (already confirmed in your code)
- Check that the server is binding to the correct host and port
- Verify MongoDB connection is successful

### 3. Environment Variables

Ensure all required environment variables are set in the Render dashboard:

- `NODE_ENV`: production
- `RENDER`: true
- `PORT`: 3001
- `FRONTEND_URL`: https://boxcric.netlify.app
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret
- `JWT_EXPIRES_IN`: 7d
- `CASHFREE_APP_ID`: Your Cashfree App ID
- `CASHFREE_SECRET_KEY`: Your Cashfree Secret Key
- `CASHFREE_API_URL`: https://api.cashfree.com/pg

## Verifying Deployment

After deployment, verify your API is working by accessing:

- Health check: https://boxcric-api.onrender.com/api/health

You should receive a JSON response with `status: "OK"` and other information.

## Troubleshooting

If deployment issues persist:

1. Check Render logs for specific error messages
2. Verify your MongoDB Atlas connection is working
3. Ensure your Render service has sufficient resources
4. Check for any rate limiting or IP blocking issues

## Support

If you continue to experience issues, contact Render support with your service ID and deployment logs.