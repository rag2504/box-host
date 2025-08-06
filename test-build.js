#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🧪 Testing build process...');

// Test 1: Check if we can build the frontend
console.log('\n1. Testing frontend build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Frontend build successful');
} catch (error) {
  console.error('❌ Frontend build failed:', error.message);
  process.exit(1);
}

// Test 2: Check if dist folder exists and has required files
console.log('\n2. Checking dist folder contents...');
const distPath = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ dist folder not found');
  process.exit(1);
}

const requiredFiles = ['index.html', 'assets'];
const distContents = fs.readdirSync(distPath);
console.log('📁 Files in dist folder:', distContents);

for (const file of requiredFiles) {
  if (!distContents.includes(file)) {
    console.error(`❌ Required file/folder missing: ${file}`);
    process.exit(1);
  }
}

// Test 3: Check if assets folder has files
console.log('\n3. Checking assets folder...');
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  const assetsContents = fs.readdirSync(assetsPath);
  console.log('📁 Files in assets folder:', assetsContents);
  
  if (assetsContents.length === 0) {
    console.error('❌ Assets folder is empty');
    process.exit(1);
  }
}

// Test 4: Test Netlify build command
console.log('\n4. Testing Netlify build command...');
try {
  execSync('npm run build:netlify', { stdio: 'inherit' });
  console.log('✅ Netlify build command successful');
} catch (error) {
  console.error('❌ Netlify build command failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 All build tests passed!');
console.log('\n📋 Ready for deployment:');
console.log('- Render: Push to GitHub and redeploy');
console.log('- Netlify: Push to GitHub or trigger manual deploy'); 