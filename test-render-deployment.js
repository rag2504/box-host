import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if server/index.js exists
const serverPath = resolve(__dirname, 'server/index.js');
if (!existsSync(serverPath)) {
  console.error('❌ Error: server/index.js not found!');
  process.exit(1);
}

console.log('🔍 Testing BoxCric API with Render deployment environment...');

// Set up environment variables to simulate Render environment
const env = {
  ...process.env,
  NODE_ENV: 'production',
  RENDER: 'true',
  PORT: '3001',
  FRONTEND_URL: 'https://boxcric.netlify.app',
  EMAIL_HOST: 'smtp.gmail.com',
  EMAIL_PORT: '587',
  EMAIL_USER: process.env.EMAIL_USER || 'test@example.com',
  EMAIL_PASS: process.env.EMAIL_PASS || 'password_placeholder',
  EMAIL_FROM: 'BoxCric <noreply@boxcric.com>',
};

// Log the environment variables we're using
console.log('\n📋 Environment Variables:');
console.log(`NODE_ENV: ${env.NODE_ENV}`);
console.log(`RENDER: ${env.RENDER}`);
console.log(`PORT: ${env.PORT}`);
console.log(`FRONTEND_URL: ${env.FRONTEND_URL}`);
console.log(`MONGODB_URI: ${env.MONGODB_URI ? '✅ Set' : '❌ Not set'}`);
console.log(`JWT_SECRET: ${env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);
console.log(`CASHFREE_APP_ID: ${env.CASHFREE_APP_ID ? '✅ Set' : '❌ Not set'}`);
console.log(`EMAIL_HOST: ${env.EMAIL_HOST ? '✅ Set' : '❌ Not set'}`);
console.log(`EMAIL_PORT: ${env.EMAIL_PORT ? '✅ Set' : '❌ Not set'}`);
console.log(`EMAIL_USER: ${env.EMAIL_USER ? '✅ Set' : '❌ Not set'}`);
console.log(`EMAIL_PASS: ${env.EMAIL_PASS ? '✅ Set' : '❌ Not set (required for email functionality)'}`);
console.log('\n');

// Start the server with the Render environment
console.log('🚀 Starting server with Render environment...');
const server = spawn('node', ['server/index.js'], { env, stdio: 'inherit' });

// Handle server exit
server.on('close', (code) => {
  if (code !== 0) {
    console.error(`\n❌ Server process exited with code ${code}`);
  }
});

// Handle CTRL+C to gracefully shut down the server
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping server...');
  server.kill();
  process.exit(0);
});

console.log('\n⚠️ Press CTRL+C to stop the server');
console.log('\n📝 After the server starts, test the health endpoint at:');
console.log('   http://localhost:3001/api/health');