#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting Netlify deployment preparation...');

// Step 1: Clean and rebuild
console.log('\n1. Cleaning previous build...');
try {
  if (fs.existsSync('dist')) {
    execSync('rm -rf dist', { stdio: 'inherit' });
  }
  console.log('✅ Cleaned previous build');
} catch (error) {
  console.log('⚠️ Could not clean dist folder:', error.message);
}

// Step 2: Install dependencies
console.log('\n2. Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Step 3: Build the project
console.log('\n3. Building the project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 4: Copy public files
console.log('\n4. Copying public files...');
try {
  if (fs.existsSync('public')) {
    execSync('cp -r public/* dist/', { stdio: 'inherit' });
    console.log('✅ Public files copied');
  } else {
    console.log('⚠️ No public folder found');
  }
} catch (error) {
  console.log('⚠️ Could not copy public files:', error.message);
}

// Step 5: Verify build output
console.log('\n5. Verifying build output...');
const distPath = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ dist folder not found after build');
  process.exit(1);
}

const distContents = fs.readdirSync(distPath);
console.log('📁 Files in dist folder:', distContents);

const requiredFiles = ['index.html', 'assets'];
for (const file of requiredFiles) {
  if (!distContents.includes(file)) {
    console.error(`❌ Required file/folder missing: ${file}`);
    process.exit(1);
  }
}

// Check assets folder
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  const assetsContents = fs.readdirSync(assetsPath);
  console.log('📁 Files in assets folder:', assetsContents);
  
  if (assetsContents.length === 0) {
    console.error('❌ Assets folder is empty');
    process.exit(1);
  }
}

// Step 6: Create _redirects file for SPA routing
console.log('\n6. Creating _redirects file for SPA routing...');
const redirectsContent = `/*    /index.html   200`;
fs.writeFileSync(path.join(distPath, '_redirects'), redirectsContent);
console.log('✅ _redirects file created');

// Step 7: Create _headers file for security headers
console.log('\n7. Creating _headers file...');
const headersContent = `/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/assets/*
  Cache-Control: public, max-age=31536000, immutable`;
fs.writeFileSync(path.join(distPath, '_headers'), headersContent);
console.log('✅ _headers file created');

console.log('\n🎉 Netlify deployment preparation completed!');
console.log('\n📋 Next steps:');
console.log('1. Push your code to GitHub');
console.log('2. In Netlify dashboard:');
console.log('   - Connect your GitHub repository');
console.log('   - Set build command: npm run build');
console.log('   - Set publish directory: dist');
console.log('   - Set environment variable: VITE_API_URL=https://box-host-1.onrender.com/api');
console.log('3. Deploy!');
console.log('\n🔗 Your site will be available at: https://boxcric.netlify.app');