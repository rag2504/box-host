// Simple script to help with deployment to Render
import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('📦 BoxCric Render Deployment Helper');
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

    // Provide Render deployment URL
    console.log('\n📋 Deployment Instructions:');
    console.log('1. Go to your Render dashboard: https://dashboard.render.com');
    console.log('2. Select your BoxCric API service');
    console.log('3. Click "Manual Deploy" and select "Deploy latest commit"');
    console.log('4. Wait for the deployment to complete');
    console.log('\n🔍 After deployment, check the health endpoint:');
    console.log('   https://boxcric-api.onrender.com/api/health');

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