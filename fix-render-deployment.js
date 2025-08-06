/**
 * Fix Render Deployment Script
 * 
 * This script helps diagnose and fix common issues with Render deployments
 * that get stuck in the building/deploying stage.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Check if render.yaml exists and has correct configuration
const checkRenderYaml = () => {
  console.log('\n🔍 Checking render.yaml configuration...');
  
  try {
    if (!fs.existsSync('./render.yaml')) {
      console.log('❌ render.yaml not found!');
      return false;
    }
    
    const renderYaml = fs.readFileSync('./render.yaml', 'utf8');
    
    // Check for port configuration
    if (renderYaml.includes('PORT') && renderYaml.includes('value: 10000')) {
      console.log('⚠️ PORT is set to 10000 in render.yaml, but server code uses process.env.PORT || 3001');
      console.log('   This might cause issues if the application is hardcoded to listen on a specific port');
      return false;
    }
    
    console.log('✅ render.yaml exists and seems properly configured');
    return true;
  } catch (error) {
    console.error('❌ Error checking render.yaml:', error.message);
    return false;
  }
};

// Check server code for port and host configuration
const checkServerCode = () => {
  console.log('\n🔍 Checking server code configuration...');
  
  try {
    if (!fs.existsSync('./server/index.js')) {
      console.log('❌ server/index.js not found!');
      return false;
    }
    
    const serverCode = fs.readFileSync('./server/index.js', 'utf8');
    
    // Check for port configuration
    const portRegex = /const\s+PORT\s*=\s*process\.env\.PORT\s*\|\|\s*(\d+)/;
    const portMatch = serverCode.match(portRegex);
    
    if (portMatch) {
      const defaultPort = portMatch[1];
      console.log(`ℹ️ Server uses PORT environment variable with default: ${defaultPort}`);
    }
    
    // Check for host configuration
    const hostRegex = /const\s+HOST\s*=\s*process\.env\.NODE_ENV\s*===\s*['"](\w+)['"]\s*\?\s*['"](\S+)['"]\s*:\s*['"](\S+)['"]\s*/;
    const hostMatch = serverCode.match(hostRegex);
    
    if (hostMatch) {
      const envType = hostMatch[1];
      const prodHost = hostMatch[2];
      const devHost = hostMatch[3];
      
      console.log(`ℹ️ Server uses HOST configuration: ${envType === 'production' ? prodHost : devHost} (${envType} mode)`);
      
      if (prodHost !== '0.0.0.0') {
        console.log('⚠️ Production HOST is not set to 0.0.0.0, which is required for Render');
        return false;
      }
    }
    
    console.log('✅ Server code seems properly configured for Render deployment');
    return true;
  } catch (error) {
    console.error('❌ Error checking server code:', error.message);
    return false;
  }
};

// Fix render.yaml if needed
const fixRenderYaml = () => {
  console.log('\n🔧 Fixing render.yaml configuration...');
  
  try {
    if (!fs.existsSync('./render.yaml')) {
      console.log('❌ render.yaml not found! Creating a new one...');
      
      const renderYamlContent = `services:
  - type: web
    name: boxcric-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: FRONTEND_URL
        value: https://boxcric.netlify.app
      - key: MONGODB_URI
        fromDatabase:
          name: boxcric-db
          property: connectionString
      - key: JWT_SECRET
        sync: false
      - key: JWT_EXPIRES_IN
        value: 7d
      - key: CASHFREE_APP_ID
        sync: false
      - key: CASHFREE_SECRET_KEY
        sync: false
      - key: CASHFREE_API_URL
        value: https://api.cashfree.com/pg

databases:
  - name: boxcric-db
    databaseName: boxcricket
    plan: free`;
      
      fs.writeFileSync('./render.yaml', renderYamlContent, 'utf8');
      console.log('✅ Created new render.yaml with correct configuration');
      return true;
    }
    
    let renderYaml = fs.readFileSync('./render.yaml', 'utf8');
    
    // Fix PORT value if needed
    if (renderYaml.includes('PORT') && renderYaml.includes('value: 10000')) {
      renderYaml = renderYaml.replace('value: 10000', 'value: 3001');
      fs.writeFileSync('./render.yaml', renderYaml, 'utf8');
      console.log('✅ Updated PORT value in render.yaml from 10000 to 3001');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error fixing render.yaml:', error.message);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('🚀 Starting Render Deployment Fix Script');
  
  const renderYamlOk = checkRenderYaml();
  const serverCodeOk = checkServerCode();
  
  if (!renderYamlOk) {
    fixRenderYaml();
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
};

main().catch(console.error);