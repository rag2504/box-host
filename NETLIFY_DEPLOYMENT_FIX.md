# Netlify Deployment Fix Guide

## Current Issue
Your Netlify deployment is showing a blank page because the frontend files aren't being built or served correctly.

## Immediate Fix Steps

### Step 1: Run the Deployment Script (Windows)

Open PowerShell in your project directory and run:

```powershell
.\deploy-netlify.ps1
```

This will:
- Clean the previous build
- Install dependencies
- Build the project
- Copy public files
- Create necessary Netlify files (_redirects, _headers)
- Verify the build output

### Step 2: Commit and Push Changes

```bash
git add .
git commit -m "Fix Netlify deployment configuration"
git push origin main
```

### Step 3: Fix Netlify Configuration

**In your Netlify dashboard:**

1. **Go to Site Settings → Build & Deploy**
2. **Set these values:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** `20`

3. **Add Environment Variable:**
   - **Key:** `VITE_API_URL`
   - **Value:** `https://box-host-1.onrender.com/api`

### Step 4: Trigger New Deployment

1. **Go to Deploys tab**
2. **Click "Trigger deploy" → "Deploy site"**
3. **Wait for deployment to complete**

## Files That Were Fixed

### 1. `netlify.toml` - Updated Configuration
```toml
[build]
  command = "npm run build"  # Simplified build command
  publish = "dist"           # Correct publish directory

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. `vite.config.ts` - Enhanced Build Configuration
```typescript
build: {
  outDir: 'dist',
  assetsDir: 'assets',
  sourcemap: false,
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
      },
    },
  },
  chunkSizeWarningLimit: 1000,
},
```

### 3. `package.json` - Updated Build Scripts
```json
{
  "build:netlify": "npm run build && npm run copy-public",
  "copy-public": "cp -r public/* dist/ 2>/dev/null || echo 'No public files to copy'"
}
```

## Expected Results

After following these steps:

✅ **Netlify will show your React app instead of a blank page**
✅ **All frontend files will be properly built and served**
✅ **API calls will work through the Render backend**
✅ **SPA routing will work correctly**

## Troubleshooting

### If still showing blank page:

1. **Check Netlify build logs** for errors
2. **Verify the `dist` folder contains:**
   - `index.html`
   - `assets/` folder with CSS and JS files
   - `_redirects` file
   - `_headers` file

3. **Check browser console** for JavaScript errors
4. **Verify environment variables** are set correctly

### If build fails:

1. **Check Node.js version** (should be 20.x)
2. **Verify all dependencies** are installed
3. **Check for TypeScript errors** in the build logs

## Quick Test

After deployment, test these URLs:

- **Main site:** https://boxcric.netlify.app
- **API health check:** https://box-host-1.onrender.com/api/health
- **Direct API test:** https://box-host-1.onrender.com/api/grounds

## Alternative: Manual Deployment

If the automatic deployment doesn't work:

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to Netlify manually:
   - Go to Netlify dashboard
   - Drag and drop the `dist` folder
   - Set the domain to `boxcric.netlify.app`

## Files Created/Modified

- ✅ `netlify.toml` - Fixed build configuration
- ✅ `vite.config.ts` - Enhanced build settings
- ✅ `package.json` - Added build scripts
- ✅ `deploy-netlify.ps1` - Windows deployment script
- ✅ `deploy-to-netlify.js` - Node.js deployment script

## Next Steps

1. **Run the PowerShell script**
2. **Push changes to GitHub**
3. **Update Netlify settings**
4. **Trigger new deployment**
5. **Test the live site**

The key fix is ensuring Netlify uses the correct build command (`npm run build`) and publish directory (`dist`). 