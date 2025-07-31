/**
 * Test Server in Render-like Environment
 * 
 * This script runs your server with the RENDER environment variable set
 * to simulate the Render deployment environment locally.
 */

import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Set Render-like environment variables
const renderEnv = {
  ...process.env,
  NODE_ENV: 'production',
  RENDER: 'true',
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
console.log(`  RENDER: ${renderEnv.RENDER}`);
console.log(`  PORT: ${renderEnv.PORT}`);
console.log(`  FRONTEND_URL: ${renderEnv.FRONTEND_URL}`);
console.log(`  MONGODB_URI: ${renderEnv.MONGODB_URI ? '✅ Set' : '❌ Not set'}`);
console.log(`  JWT_SECRET: ${renderEnv.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);
console.log(`  CASHFREE_APP_ID: ${renderEnv.CASHFREE_APP_ID ? '✅ Set' : '❌ Not set'}`);

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