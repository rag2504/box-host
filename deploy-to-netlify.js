/**
 * Deploy to Netlify Script
 * 
 * This script helps deploy the frontend to Netlify separately from the backend.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 BoxCric Netlify Deployment Helper');
console.log('====================================');

// Check if git is installed
try {
  execSync('git --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Git is not installed. Please install Git and try again.');
  process.exit(1);
}

// Check if we're in a git repository
try {
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Not in a git repository. Please run this script from the root of your BoxCric project.');
  process.exit(1);
}

// Check if netlify.toml exists
if (!fs.existsSync('./netlify.toml')) {
  console.error('❌ netlify.toml not found!');
  process.exit(1);
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
`;
  
  fs.writeFileSync('./.env.production', envProduction, 'utf8');
  console.log('✅ Created .env.production with production settings');
} else {
  console.log('✅ .env.production already exists');
  
  // Check if VITE_API_URL is set correctly
  const envProduction = fs.readFileSync('./.env.production', 'utf8');
  if (!envProduction.includes('VITE_API_URL=https://boxcric-api.onrender.com/api')) {
    console.error('❌ VITE_API_URL in .env.production is not set correctly!');
    console.log('🔧 Fixing .env.production...');
    
    // Update .env.production
    const updatedEnvProduction = envProduction.replace(
      /VITE_API_URL=.*$/m,
      'VITE_API_URL=https://boxcric-api.onrender.com/api'
    );
    
    fs.writeFileSync('./.env.production', updatedEnvProduction, 'utf8');
    console.log('✅ Updated VITE_API_URL in .env.production');
  }
}

// Check netlify.toml configuration
const netlifyToml = fs.readFileSync('./netlify.toml', 'utf8');

// Check if build command is set correctly
if (!netlifyToml.includes('command = \'npm run build\'')) {
  console.error('❌ build command in netlify.toml is not set correctly!');
  console.log('🔧 Fixing netlify.toml...');
  
  // Update netlify.toml
  const updatedNetlifyToml = netlifyToml.replace(
    /command = .*$/m,
    "command = 'npm run build'"
  );
  
  fs.writeFileSync('./netlify.toml', updatedNetlifyToml, 'utf8');
  console.log('✅ Updated build command in netlify.toml');
}

// Check if publish directory is set correctly
if (!netlifyToml.includes('publish = \'src\'')) {
  console.error('❌ publish directory in netlify.toml is not set correctly!');
  console.log('🔧 Fixing netlify.toml...');
  
  // Update netlify.toml
  const updatedNetlifyToml = netlifyToml.replace(
    /publish = .*$/m,
    "publish = 'src'"
  );
  
  fs.writeFileSync('./netlify.toml', updatedNetlifyToml, 'utf8');
  console.log('✅ Updated publish directory in netlify.toml');
}

// Check if API proxy is set correctly
if (!netlifyToml.includes('from = "/api/*"') || !netlifyToml.includes('to = "https://boxcric-api.onrender.com/api/:splat"')) {
  console.error('❌ API proxy in netlify.toml is not set correctly!');
  console.log('🔧 Fixing netlify.toml...');
  
  // Check if redirects section exists
  if (!netlifyToml.includes('[[redirects]]')) {
    // Add redirects section
    const updatedNetlifyToml = netlifyToml + '\n# Handle SPA routing\n[[redirects]]\n  from = "/*"\n  to = "/index.html"\n  status = 200\n\n# Proxy API requests to backend\n[[redirects]]\n  from = "/api/*"\n  to = "https://boxcric-api.onrender.com/api/:splat"\n  status = 200\n  force = true';
    
    fs.writeFileSync('./netlify.toml', updatedNetlifyToml, 'utf8');
    console.log('✅ Added redirects section to netlify.toml');
  } else {
    // Update existing redirects section
    const updatedNetlifyToml = netlifyToml.replace(
      /from = "\/api\/\*"[\s\S]*?to = ".*?"[\s\S]*?status = 200/m,
      'from = "/api/*"\n  to = "https://boxcric-api.onrender.com/api/:splat"\n  status = 200'
    );
    
    fs.writeFileSync('./netlify.toml', updatedNetlifyToml, 'utf8');
    console.log('✅ Updated API proxy in netlify.toml');
  }
}

// Main deployment function
async function deploy() {
  try {
    // Check for uncommitted changes
    const status = execSync('git status --porcelain').toString();
    if (status) {
      console.log('⚠️ You have uncommitted changes:');
      console.log(status);
      
      const answer = await question('Do you want to commit these changes before deploying? (y/n): ');
      if (answer.toLowerCase() === 'y') {
        const commitMessage = await question('Enter commit message: ');
        execSync('git add .', { stdio: 'inherit' });
        execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
        console.log('✅ Changes committed successfully.');
      } else {
        console.log('⚠️ Proceeding with uncommitted changes. They will not be included in the deployment.');
      }
    }

    // Check current branch
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    console.log(`📌 Current branch: ${currentBranch}`);
    
    if (currentBranch !== 'main') {
      const answer = await question('You are not on the main branch. Do you want to switch to main? (y/n): ');
      if (answer.toLowerCase() === 'y') {
        execSync('git checkout main', { stdio: 'inherit' });
        console.log('✅ Switched to main branch.');
      } else {
        console.log(`⚠️ Proceeding with deployment from ${currentBranch} branch.`);
      }
    }

    // Push to GitHub
    console.log('🚀 Pushing to GitHub...');
    execSync('git push', { stdio: 'inherit' });
    console.log('✅ Successfully pushed to GitHub.');

    // Build the frontend
    console.log('🔨 Building the frontend...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Frontend built successfully.');

    // Provide Netlify deployment instructions
    console.log('\n📋 Netlify Deployment Instructions:');
    console.log('1. Go to your Netlify dashboard: https://app.netlify.com');
    console.log('2. If you have already connected your GitHub repository:');
    console.log('   a. The deployment should trigger automatically');
    console.log('   b. If not, click on your site and then "Trigger deploy"');
    console.log('3. If you have not connected your GitHub repository:');
    console.log('   a. Click "Add new site" > "Import an existing project"');
    console.log('   b. Choose "GitHub" and select your repository');
    console.log('   c. Configure the build settings:');
    console.log('      - Build command: npm run build');
    console.log('      - Publish directory: src');
    console.log('   d. Click "Deploy site"');
    console.log('\n4. After deployment, check your Netlify site: https://boxcric.netlify.app');

    console.log('\n✨ Deployment process completed successfully!');
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
  } finally {
    rl.close();
  }
}

// Helper function to ask questions
function question(query) {
  return new Promise(resolve => {
    rl.question(query, answer => {
      resolve(answer);
    });
  });
}

// Run the deployment process
deploy();