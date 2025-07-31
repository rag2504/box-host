/**
 * Diagnose Render Deployment Issues
 * 
 * This script performs a comprehensive diagnosis of your Render deployment
 * configuration and provides specific fixes for the current issue where
 * the deployment is stuck in the building stage.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

console.log(`${colors.bold}${colors.magenta}BoxCric Render Deployment Diagnostic Tool${colors.reset}\n`);

// Check server binding configuration
const checkServerBinding = () => {
  console.log(`${colors.blue}Checking server binding configuration...${colors.reset}`);
  
  try {
    const serverPath = './server/index.js';
    if (!fs.existsSync(serverPath)) {
      console.log(`${colors.red}❌ server/index.js not found!${colors.reset}`);
      return { success: false, error: 'Server file not found' };
    }
    
    const serverCode = fs.readFileSync(serverPath, 'utf8');
    
    // Check how the server is configured to listen
    const listenRegex = /server\.listen\(\s*PORT\s*,\s*HOST\s*,\s*\(\)\s*=>\s*\{/;
    const hostRegex = /const\s+HOST\s*=\s*process\.env\.NODE_ENV\s*===\s*['|"]production['|"]\s*\?\s*['|"]0\.0\.0\.0['|"]\s*:\s*['|"]localhost['|"];/;
    const portRegex = /const\s+PORT\s*=\s*process\.env\.PORT\s*\|\|\s*(\d+);/;
    
    const hasCorrectListenPattern = listenRegex.test(serverCode);
    const hasCorrectHostConfig = hostRegex.test(serverCode);
    const portMatch = serverCode.match(portRegex);
    const defaultPort = portMatch ? portMatch[1] : null;
    
    console.log(`${colors.cyan}Server binding configuration:${colors.reset}`);
    console.log(`- Default port: ${defaultPort ? colors.green + defaultPort + colors.reset : colors.red + 'Not found' + colors.reset}`);
    console.log(`- Host configuration: ${hasCorrectHostConfig ? colors.green + 'Correctly set to 0.0.0.0 in production' + colors.reset : colors.red + 'Not correctly configured' + colors.reset}`);
    console.log(`- Listen pattern: ${hasCorrectListenPattern ? colors.green + 'Correctly using PORT and HOST variables' + colors.reset : colors.red + 'Not using PORT and HOST variables correctly' + colors.reset}`);
    
    return { 
      success: hasCorrectHostConfig && hasCorrectListenPattern, 
      defaultPort,
      hasCorrectHostConfig,
      hasCorrectListenPattern
    };
  } catch (error) {
    console.error(`${colors.red}Error checking server binding:${colors.reset}`, error);
    return { success: false, error: error.message };
  }
};

// Check render.yaml configuration
const checkRenderYaml = () => {
  console.log(`\n${colors.blue}Checking render.yaml configuration...${colors.reset}`);
  
  try {
    const renderYamlPath = './render.yaml';
    if (!fs.existsSync(renderYamlPath)) {
      console.log(`${colors.red}❌ render.yaml not found!${colors.reset}`);
      return { success: false, error: 'render.yaml not found' };
    }
    
    const renderYaml = fs.readFileSync(renderYamlPath, 'utf8');
    
    // Check for port configuration
    const portMatch = renderYaml.match(/\s+- key: PORT\s+value: (\d+)/);
    const portValue = portMatch ? portMatch[1] : null;
    
    // Check for health check path
    const healthCheckMatch = renderYaml.match(/healthCheckPath:\s*(\/[^\s]+)/);
    const healthCheckPath = healthCheckMatch ? healthCheckMatch[1] : null;
    
    console.log(`${colors.cyan}render.yaml configuration:${colors.reset}`);
    console.log(`- PORT value: ${portValue ? colors.green + portValue + colors.reset : colors.red + 'Not found' + colors.reset}`);
    console.log(`- Health check path: ${healthCheckPath ? colors.green + healthCheckPath + colors.reset : colors.red + 'Not found' + colors.reset}`);
    
    return { 
      success: !!portValue && !!healthCheckPath, 
      portValue,
      healthCheckPath
    };
  } catch (error) {
    console.error(`${colors.red}Error checking render.yaml:${colors.reset}`, error);
    return { success: false, error: error.message };
  }
};

// Check for port mismatch between render.yaml and server code
const checkPortMismatch = (renderPort, serverDefaultPort) => {
  console.log(`\n${colors.blue}Checking for port configuration mismatch...${colors.reset}`);
  
  if (!renderPort || !serverDefaultPort) {
    console.log(`${colors.yellow}⚠️ Cannot check for port mismatch - missing port information${colors.reset}`);
    return { success: false, error: 'Missing port information' };
  }
  
  const mismatch = renderPort !== serverDefaultPort;
  
  if (mismatch) {
    console.log(`${colors.red}❌ Port mismatch detected!${colors.reset}`);
    console.log(`- render.yaml PORT: ${colors.yellow}${renderPort}${colors.reset}`);
    console.log(`- Server default PORT: ${colors.yellow}${serverDefaultPort}${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ Port configuration is consistent between render.yaml and server code${colors.reset}`);
  }
  
  return { success: !mismatch, mismatch, renderPort, serverDefaultPort };
};

// Fix port mismatch in render.yaml
const fixPortMismatch = (renderPort, serverDefaultPort) => {
  console.log(`\n${colors.blue}Fixing port mismatch in render.yaml...${colors.reset}`);
  
  try {
    const renderYamlPath = './render.yaml';
    let renderYaml = fs.readFileSync(renderYamlPath, 'utf8');
    
    // Replace the port value
    renderYaml = renderYaml.replace(
      new RegExp(`\\s+- key: PORT\\s+value: ${renderPort}`), 
      `      - key: PORT\n        value: ${serverDefaultPort}`
    );
    
    fs.writeFileSync(renderYamlPath, renderYaml, 'utf8');
    console.log(`${colors.green}✓ Updated PORT value in render.yaml from ${renderPort} to ${serverDefaultPort}${colors.reset}`);
    
    return { success: true };
  } catch (error) {
    console.error(`${colors.red}Error fixing port mismatch:${colors.reset}`, error);
    return { success: false, error: error.message };
  }
};

// Check for Node.js version issues
const checkNodeVersion = () => {
  console.log(`\n${colors.blue}Checking Node.js version configuration...${colors.reset}`);
  
  try {
    const packageJsonPath = './package.json';
    if (!fs.existsSync(packageJsonPath)) {
      console.log(`${colors.red}❌ package.json not found!${colors.reset}`);
      return { success: false, error: 'package.json not found' };
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const hasEngines = packageJson.engines && packageJson.engines.node;
    const nodeVersion = hasEngines ? packageJson.engines.node : null;
    
    console.log(`${colors.cyan}Node.js version configuration:${colors.reset}`);
    console.log(`- engines.node: ${nodeVersion ? colors.green + nodeVersion + colors.reset : colors.red + 'Not specified' + colors.reset}`);
    
    if (nodeVersion && nodeVersion.startsWith('18')) {
      console.log(`${colors.yellow}⚠️ Node.js 18.x has reached end-of-life according to Render logs${colors.reset}`);
      console.log(`${colors.yellow}⚠️ Consider upgrading to Node.js 20.x for better support${colors.reset}`);
    }
    
    return { success: hasEngines, nodeVersion };
  } catch (error) {
    console.error(`${colors.red}Error checking Node.js version:${colors.reset}`, error);
    return { success: false, error: error.message };
  }
};

// Run all diagnostics and fix issues
const runDiagnostics = async () => {
  console.log(`${colors.bold}${colors.magenta}Running comprehensive deployment diagnostics...${colors.reset}\n`);
  
  // Check server binding
  const serverBindingResult = checkServerBinding();
  
  // Check render.yaml
  const renderYamlResult = checkRenderYaml();
  
  // Check for port mismatch
  let portMismatchResult = { success: true };
  if (serverBindingResult.success && renderYamlResult.success) {
    portMismatchResult = checkPortMismatch(renderYamlResult.portValue, serverBindingResult.defaultPort);
    
    // Fix port mismatch if detected
    if (portMismatchResult.mismatch) {
      const fixResult = fixPortMismatch(portMismatchResult.renderPort, portMismatchResult.serverDefaultPort);
      if (fixResult.success) {
        console.log(`${colors.green}✓ Successfully fixed port mismatch${colors.reset}`);
      }
    }
  }
  
  // Check Node.js version
  const nodeVersionResult = checkNodeVersion();
  
  // Summarize findings and provide recommendations
  console.log(`\n${colors.bold}${colors.magenta}Diagnostic Summary:${colors.reset}`);
  
  const issues = [];
  
  if (!serverBindingResult.success) {
    issues.push('Server binding configuration issue');
  }
  
  if (!renderYamlResult.success) {
    issues.push('render.yaml configuration issue');
  }
  
  if (portMismatchResult.mismatch) {
    issues.push(`Port mismatch between render.yaml (${portMismatchResult.renderPort}) and server (${portMismatchResult.serverDefaultPort})`);
  }
  
  if (!nodeVersionResult.success) {
    issues.push('Node.js version not specified in package.json');
  } else if (nodeVersionResult.nodeVersion && nodeVersionResult.nodeVersion.startsWith('18')) {
    issues.push('Node.js 18.x has reached end-of-life');
  }
  
  if (issues.length > 0) {
    console.log(`${colors.yellow}Found ${issues.length} issue(s) that may affect deployment:${colors.reset}`);
    issues.forEach((issue, index) => {
      console.log(`${colors.yellow}${index + 1}. ${issue}${colors.reset}`);
    });
  } else {
    console.log(`${colors.green}No critical issues found in your deployment configuration!${colors.reset}`);
  }
  
  // Provide next steps
  console.log(`\n${colors.bold}${colors.cyan}Next Steps:${colors.reset}`);
  console.log(`1. ${colors.green}Commit and push the changes to your repository${colors.reset}`);
  console.log(`2. ${colors.green}In the Render dashboard, manually trigger a new deployment${colors.reset}`);
  console.log(`3. ${colors.green}Monitor the deployment logs for any errors${colors.reset}`);
  console.log(`4. ${colors.green}Check if the health check endpoint is accessible after deployment${colors.reset}`);
  
  // Additional recommendations
  console.log(`\n${colors.bold}${colors.cyan}Additional Recommendations:${colors.reset}`);
  console.log(`1. ${colors.cyan}Make sure your MongoDB connection string is correctly set in Render environment variables${colors.reset}`);
  console.log(`2. ${colors.cyan}Verify that all required environment variables are set in Render${colors.reset}`);
  console.log(`3. ${colors.cyan}Consider upgrading to Node.js 20.x for better support${colors.reset}`);
};

// Run the diagnostics
runDiagnostics().catch(error => {
  console.error(`${colors.red}Error running diagnostics:${colors.reset}`, error);
});

console.log(`\n${colors.green}To run this diagnostic script:${colors.reset}`);
console.log(`${colors.cyan}node diagnose-render-deployment.js${colors.reset}`);