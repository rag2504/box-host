/**
 * Test Server Locally
 * 
 * This script helps test your server locally before deploying to Render.
 * It simulates the Render environment by setting the same environment variables.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Set production environment variables
const renderEnv = {
  ...process.env,
  NODE_ENV: 'production',
  PORT: '3001',
  FRONTEND_URL: 'https://boxcric.netlify.app',
  // Keep existing MongoDB URI
  MONGODB_URI: process.env.MONGODB_URI,
  // Keep existing JWT settings
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: '7d',
  // Keep existing Cashfree settings
  CASHFREE_APP_ID: process.env.CASHFREE_APP_ID,
  CASHFREE_SECRET_KEY: process.env.CASHFREE_SECRET_KEY,
  CASHFREE_API_URL: process.env.CASHFREE_API_URL || 'https://api.cashfree.com/pg',
};

console.log('🚀 Starting server in Render-like environment...');
console.log('📋 Environment variables:');
console.log(`  NODE_ENV: ${renderEnv.NODE_ENV}`);
console.log(`  PORT: ${renderEnv.PORT}`);
console.log(`  FRONTEND_URL: ${renderEnv.FRONTEND_URL}`);
console.log(`  MONGODB_URI: ${renderEnv.MONGODB_URI ? '✅ Set' : '❌ Not set'}`);
console.log(`  JWT_SECRET: ${renderEnv.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);
console.log(`  CASHFREE_APP_ID: ${renderEnv.CASHFREE_APP_ID ? '✅ Set' : '❌ Not set'}`);

// Check if server/index.js exists
if (!fs.existsSync('./server/index.js')) {
  console.error('❌ server/index.js not found!');
  process.exit(1);
}

console.log('\n📡 Starting server...');
console.log('Press Ctrl+C to stop the server');

try {
  // Start the server with the Render-like environment
  execSync('node server/index.js', {
    env: renderEnv,
    stdio: 'inherit',
  });
} catch (error) {
  console.error('❌ Error starting server:', error.message);
  process.exit(1);
}