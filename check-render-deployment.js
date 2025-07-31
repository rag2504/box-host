/**
 * Check Render Deployment Status
 * 
 * This script checks if your Render deployment is working properly
 * by testing the health check endpoint and providing detailed diagnostics.
 */

import axios from 'axios';
import { execSync } from 'child_process';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Configuration
const RENDER_API_URL = 'https://boxcric-api.onrender.com';
const HEALTH_CHECK_PATH = '/api/health';
const LOCAL_API_URL = 'http://localhost:3001';

console.log(`${colors.bold}${colors.magenta}BoxCric Render Deployment Status Checker${colors.reset}\n`);

// Check if a URL is accessible
const checkEndpoint = async (url, description) => {
  console.log(`${colors.blue}Checking ${description} at ${url}...${colors.reset}`);
  
  try {
    const startTime = Date.now();
    const response = await axios.get(url, { timeout: 10000 });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`${colors.green}✓ ${description} is accessible!${colors.reset}`);
    console.log(`- Status code: ${colors.green}${response.status}${colors.reset}`);
    console.log(`- Response time: ${colors.green}${responseTime}ms${colors.reset}`);
    console.log(`- Response data: ${colors.cyan}${JSON.stringify(response.data, null, 2)}${colors.reset}`);
    
    return { success: true, status: response.status, data: response.data, responseTime };
  } catch (error) {
    console.log(`${colors.red}✗ ${description} is not accessible!${colors.reset}`);
    
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      console.log(`- Status code: ${colors.red}${error.response.status}${colors.reset}`);
      console.log(`- Response data: ${colors.red}${JSON.stringify(error.response.data, null, 2)}${colors.reset}`);
      return { success: false, status: error.response.status, data: error.response.data };
    } else if (error.request) {
      // The request was made but no response was received
      console.log(`- Error: ${colors.red}No response received from server${colors.reset}`);
      return { success: false, error: 'No response received' };
    } else {
      // Something happened in setting up the request
      console.log(`- Error: ${colors.red}${error.message}${colors.reset}`);
      return { success: false, error: error.message };
    }
  }
};

// Check DNS resolution for the Render domain
const checkDNS = (domain) => {
  console.log(`\n${colors.blue}Checking DNS resolution for ${domain}...${colors.reset}`);
  
  try {
    // Use nslookup to check DNS resolution
    const result = execSync(`nslookup ${domain}`).toString();
    console.log(`${colors.green}✓ DNS resolution successful${colors.reset}`);
    console.log(`${colors.cyan}${result}${colors.reset}`);
    return { success: true, result };
  } catch (error) {
    console.log(`${colors.red}✗ DNS resolution failed${colors.reset}`);
    console.log(`${colors.red}${error.message}${colors.reset}`);
    return { success: false, error: error.message };
  }
};

// Check if the local server is running
const checkLocalServer = async () => {
  console.log(`\n${colors.blue}Checking if local server is running...${colors.reset}`);
  
  try {
    const result = await checkEndpoint(`${LOCAL_API_URL}${HEALTH_CHECK_PATH}`, 'Local health check endpoint');
    return result;
  } catch (error) {
    console.log(`${colors.red}✗ Local server check failed${colors.reset}`);
    console.log(`${colors.red}${error.message}${colors.reset}`);
    return { success: false, error: error.message };
  }
};

// Run all checks
const runChecks = async () => {
  // Extract domain from Render API URL
  const domain = RENDER_API_URL.replace('https://', '').replace('http://', '');
  
  // Check DNS resolution
  await checkDNS(domain);
  
  // Check Render deployment health endpoint
  console.log(`\n${colors.blue}Checking Render deployment...${colors.reset}`);
  const renderResult = await checkEndpoint(`${RENDER_API_URL}${HEALTH_CHECK_PATH}`, 'Render health check endpoint');
  
  // Check if local server is running (optional)
  const checkLocal = process.argv.includes('--check-local');
  let localResult = { success: false, skipped: true };
  
  if (checkLocal) {
    localResult = await checkLocalServer();
  } else {
    console.log(`\n${colors.yellow}Skipping local server check. Use --check-local flag to check local server.${colors.reset}`);
  }
  
  // Provide summary and recommendations
  console.log(`\n${colors.bold}${colors.magenta}Deployment Status Summary:${colors.reset}`);
  
  if (renderResult.success) {
    console.log(`${colors.green}✓ Render deployment is working properly!${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Render deployment is not working properly!${colors.reset}`);
    
    console.log(`\n${colors.bold}${colors.yellow}Possible issues:${colors.reset}`);
    console.log(`1. ${colors.yellow}The deployment might still be in progress${colors.reset}`);
    console.log(`2. ${colors.yellow}The server might not be binding to the correct host (0.0.0.0)${colors.reset}`);
    console.log(`3. ${colors.yellow}The health check endpoint might not be implemented correctly${colors.reset}`);
    console.log(`4. ${colors.yellow}There might be an issue with environment variables${colors.reset}`);
    console.log(`5. ${colors.yellow}The server might be crashing during startup${colors.reset}`);
    
    console.log(`\n${colors.bold}${colors.cyan}Recommendations:${colors.reset}`);
    console.log(`1. ${colors.cyan}Check the Render logs for any errors${colors.reset}`);
    console.log(`2. ${colors.cyan}Make sure your server is binding to 0.0.0.0 in production${colors.reset}`);
    console.log(`3. ${colors.cyan}Verify that all required environment variables are set${colors.reset}`);
    console.log(`4. ${colors.cyan}Run the diagnose-render-deployment.js script to check for configuration issues${colors.reset}`);
    console.log(`5. ${colors.cyan}Try redeploying the application${colors.reset}`);
  }
};

// Run the checks
runChecks().catch(error => {
  console.error(`${colors.red}Error running checks:${colors.reset}`, error);
});

console.log(`\n${colors.green}To run this script:${colors.reset}`);
console.log(`${colors.cyan}node check-render-deployment.js${colors.reset}`);
console.log(`${colors.cyan}node check-render-deployment.js --check-local${colors.reset} (to also check local server)`);