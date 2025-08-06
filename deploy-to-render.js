#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting Render deployment preparation...');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check if dist directory exists, if not build it
if (!fs.existsSync('dist')) {
  console.log('📦 Building frontend...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Frontend build completed');
  } catch (error) {
    console.error('❌ Frontend build failed:', error.message);
    process.exit(1);
  }
}

// Check if server directory exists
if (!fs.existsSync('server')) {
  console.error('❌ server directory not found');
  process.exit(1);
}

console.log('✅ Deployment preparation completed!');
console.log('');
console.log('📋 Next steps:');
console.log('1. Push your code to GitHub');
console.log('2. In Render dashboard:');
console.log('   - Create new Web Service');
console.log('   - Connect your GitHub repository');
console.log('   - Set build command: npm run build:render');
console.log('   - Set start command: npm run start:render');
console.log('   - Set environment variables (NODE_ENV=production, etc.)');
console.log('');
console.log('🔗 Your service will be available at: https://box-host-1.onrender.com');