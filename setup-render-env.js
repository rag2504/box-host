// Script to help with setting up environment variables on Render
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions
function question(query) {
  return new Promise(resolve => {
    rl.question(query, answer => {
      resolve(answer);
    });
  });
}

// Main function
async function main() {
  console.log('🔧 BoxCric Render Environment Setup Helper');
  console.log('=========================================');
  console.log('This script will help you set up the required environment variables for Render deployment.\n');

  // Read .env file if it exists
  const envPath = path.join(__dirname, '.env');
  let envVars = {};

  if (fs.existsSync(envPath)) {
    console.log('📄 Found .env file. Reading existing variables...');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Parse .env file
    envContent.split('\n').forEach(line => {
      // Skip comments and empty lines
      if (!line || line.startsWith('#')) return;
      
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        envVars[key.trim()] = value.trim();
      }
    });
  }

  // Required variables for Render
  const requiredVars = [
    { key: 'NODE_ENV', default: 'production', description: 'Environment (production/development)' },
    { key: 'PORT', default: '3001', description: 'Port for the server to listen on' },
    { key: 'FRONTEND_URL', default: 'https://boxcric.netlify.app', description: 'URL of the frontend application' },
    { key: 'MONGODB_URI', default: envVars.MONGODB_URI || '', description: 'MongoDB connection string' },
    { key: 'JWT_SECRET', default: envVars.JWT_SECRET || '', description: 'Secret key for JWT authentication' },
    { key: 'JWT_EXPIRES_IN', default: '7d', description: 'JWT token expiration time' },
    { key: 'EMAIL_HOST', default: 'smtp.gmail.com', description: 'SMTP host for sending emails' },
    { key: 'EMAIL_PORT', default: '587', description: 'SMTP port for sending emails' },
    { key: 'EMAIL_USER', default: envVars.EMAIL_USER || '', description: 'Email address for sending emails' },
    { key: 'EMAIL_PASS', default: envVars.EMAIL_PASS || '', description: 'Email password or app password' },
    { key: 'EMAIL_FROM', default: `BoxCric <${envVars.EMAIL_USER || 'noreply@boxcric.com'}>`, description: 'From address for emails' },
    { key: 'CASHFREE_APP_ID', default: envVars.CASHFREE_APP_ID || '', description: 'Cashfree App ID' },
    { key: 'CASHFREE_SECRET_KEY', default: envVars.CASHFREE_SECRET_KEY || '', description: 'Cashfree Secret Key' },
    { key: 'CASHFREE_API_URL', default: 'https://api.cashfree.com/pg', description: 'Cashfree API URL' },
  ];

  // Collect values for each variable
  const finalVars = {};
  for (const varInfo of requiredVars) {
    const { key, default: defaultValue, description } = varInfo;
    
    // Skip NODE_ENV and PORT as they are fixed for Render
    if (key === 'NODE_ENV' || key === 'PORT') {
      finalVars[key] = defaultValue;
      continue;
    }
    
    const answer = await question(`${key} (${description}) [${defaultValue || 'not set'}]: `);
    finalVars[key] = answer.trim() || defaultValue;
  }

  // Generate output
  console.log('\n📋 Environment Variables for Render:');
  console.log('Copy and paste these into your Render dashboard environment variables section.\n');
  
  // Print in a format easy to copy-paste
  for (const [key, value] of Object.entries(finalVars)) {
    console.log(`${key}=${value}`);
  }

  console.log('\n✅ Done! Use these variables in your Render dashboard.');
  console.log('Remember to mark sensitive variables like JWT_SECRET, EMAIL_PASS, and CASHFREE_SECRET_KEY as secret.');
  
  rl.close();
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  rl.close();
});