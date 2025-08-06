/**
 * Fix Render Start Command Script
 * 
 * This script helps fix the issue where Render is running 'npm run dev' instead of 'npm start'
 * as specified in render.yaml.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 BoxCric Render Start Command Fix Script');
console.log('============================================');

// Check if render.yaml exists
if (!fs.existsSync('./render.yaml')) {
  console.error('❌ render.yaml not found!');
  process.exit(1);
}

// Read render.yaml
const renderYaml = fs.readFileSync('./render.yaml', 'utf8');

// Check if startCommand is set correctly
if (!renderYaml.includes('startCommand: npm start')) {
  console.error('❌ startCommand in render.yaml is not set to "npm start"!');
  console.log('🔧 Fixing render.yaml...');
  
  // Update render.yaml
  const updatedRenderYaml = renderYaml.replace(
    /startCommand:.*$/m,
    'startCommand: npm start'
  );
  
  fs.writeFileSync('./render.yaml', updatedRenderYaml, 'utf8');
  console.log('✅ Updated startCommand in render.yaml to "npm start"');
} else {
  console.log('✅ startCommand in render.yaml is already set to "npm start"');
}

// Check if .env.production exists
if (!fs.existsSync('./.env.production')) {
  console.error('❌ .env.production not found!');
  console.log('🔧 Creating .env.production...');
  
  // Create .env.production
  const envProduction = `# Production Environment Variables
VITE_API_URL=https://boxcric-api.onrender.com/api
FRONTEND_URL=https://boxcric.netlify.app
NODE_ENV=production
RENDER=true

# Server
PORT=3001

# JWT
JWT_SECRET=boxcric_jwt_secret_key_super_secure_random_string_2024
JWT_EXPIRES_IN=7d

# Email Configuration (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_FROM=BoxCric <noreply@boxcric.com>

# App Configuration
APP_NAME=BoxCric
APP_URL=https://boxcric.netlify.app`;
  
  fs.writeFileSync('./.env.production', envProduction, 'utf8');
  console.log('✅ Created .env.production with production settings');
} else {
  console.log('✅ .env.production already exists');
}

// Check if package.json exists
if (!fs.existsSync('./package.json')) {
  console.error('❌ package.json not found!');
  process.exit(1);
}

// Read package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// Check if start script is set correctly
if (packageJson.scripts && packageJson.scripts.start !== 'node server/index.js') {
  console.error('❌ start script in package.json is not set to "node server/index.js"!');
  console.log('🔧 Fixing package.json...');
  
  // Update package.json
  packageJson.scripts.start = 'node server/index.js';
  
  fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2), 'utf8');
  console.log('✅ Updated start script in package.json to "node server/index.js"');
} else {
  console.log('✅ start script in package.json is already set to "node server/index.js"');
}

// Check if Procfile exists
if (!fs.existsSync('./Procfile')) {
  console.error('❌ Procfile not found!');
  console.log('🔧 Creating Procfile...');
  
  // Create Procfile
  fs.writeFileSync('./Procfile', 'web: npm start', 'utf8');
  console.log('✅ Created Procfile with "web: npm start"');
} else {
  const procfile = fs.readFileSync('./Procfile', 'utf8');
  if (procfile.trim() !== 'web: npm start') {
    console.error('❌ Procfile does not contain "web: npm start"!');
    console.log('🔧 Fixing Procfile...');
    
    // Update Procfile
    fs.writeFileSync('./Procfile', 'web: npm start', 'utf8');
    console.log('✅ Updated Procfile to "web: npm start"');
  } else {
    console.log('✅ Procfile already contains "web: npm start"');
  }
}

console.log('\n📋 Deployment Checklist:');
console.log('1. Make sure your server listens on process.env.PORT (Render sets this)');
console.log('2. Make sure your server binds to 0.0.0.0 in production (not localhost or 127.0.0.1)');
console.log('3. Make sure your health check endpoint (/api/health) returns a 200-399 status code');
console.log('4. Make sure all required environment variables are set in render.yaml or the Render dashboard');
console.log('5. Make sure your Node.js version is specified in package.json (engines field)');

console.log('\n💡 Next Steps:');
console.log('1. Commit and push these changes to your repository');
console.log('2. In the Render dashboard, manually trigger a new deployment');
console.log('3. Monitor the deployment logs for any errors');
console.log('4. After deployment, check the health endpoint: https://boxcric-api.onrender.com/api/health');
console.log('5. Deploy the frontend to Netlify separately');