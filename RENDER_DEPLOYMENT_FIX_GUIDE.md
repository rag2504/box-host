# Render Deployment Fix Guide

## Issues Identified

1. **Render is running in development mode** instead of production
2. **Backend only serves API routes** - no static file serving
3. **Netlify build configuration** needs proper setup
4. **API endpoints pointing to wrong URL**

## Fixes Applied

### 1. Updated Package.json Scripts

```json
{
  "scripts": {
    "build:render": "npm run build && npm run build:server",
    "build:server": "echo 'Server files are ready'",
    "start:render": "NODE_ENV=production node server/index.js"
  }
}
```

### 2. Updated Server Configuration

The server now serves static files in production mode:

```javascript
// Serve static files from the React app build
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React build
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}
```

### 3. Updated Render Configuration (render.yaml)

```yaml
services:
  - type: web
    name: box-host-1
    env: node
    plan: free
    buildCommand: npm run build:render
    startCommand: npm run start:render
    envVars:
      - key: NODE_ENV
        value: production
      - key: RENDER
        value: true
      # ... other environment variables
```

### 4. Updated Netlify Configuration (netlify.toml)

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 5. Fixed API Endpoint URL

Updated `src/lib/api.ts` to point to the correct Render URL:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === "localhost" ? "http://localhost:3001/api" : "https://box-host-1.onrender.com/api");
```

## Deployment Steps

### For Render:

1. **Push your code to GitHub**
2. **In Render Dashboard:**
   - Create new Web Service
   - Connect your GitHub repository
   - Set build command: `npm run build:render`
   - Set start command: `npm run start:render`
   - Set environment variables:
     - `NODE_ENV=production`
     - `RENDER=true`
     - `MONGODB_URI=your_mongodb_uri`
     - `CASHFREE_APP_ID=your_app_id`
     - `CASHFREE_SECRET_KEY=your_secret_key`
     - `EMAIL_USER=your_email`
     - `EMAIL_PASS=your_email_password`
     - `JWT_SECRET=your_jwt_secret`
     - `FRONTEND_URL=https://boxcric.netlify.app`

### For Netlify:

1. **Connect your GitHub repository**
2. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment variables:**
   - `VITE_API_URL=https://box-host-1.onrender.com/api`

## Expected Results

After deployment:

1. **Render service** will serve both API and frontend from the same domain
2. **Netlify** will serve the frontend with proper routing
3. **API calls** will work correctly between frontend and backend
4. **No more "API endpoint not found" errors**

## Testing

1. **Test Render deployment:**
   - Visit: `https://box-host-1.onrender.com`
   - Should show your React app
   - API calls should work: `https://box-host-1.onrender.com/api/health`

2. **Test Netlify deployment:**
   - Visit: `https://boxcric.netlify.app`
   - Should show your React app
   - API calls should work through the configured backend

## Troubleshooting

If you still see issues:

1. **Check Render logs** for build/start command errors
2. **Verify environment variables** are set correctly
3. **Ensure MongoDB connection** is working
4. **Check CORS settings** if API calls fail
5. **Verify the dist folder** is being created during build

## Files Modified

- `package.json` - Added production scripts
- `server/index.js` - Added static file serving
- `render.yaml` - Updated deployment configuration
- `netlify.toml` - Updated build configuration
- `src/lib/api.ts` - Fixed API endpoint URL
- `deploy-to-render.js` - Updated deployment script