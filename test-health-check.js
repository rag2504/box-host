// Simple script to test the health check endpoint

const axios = require('axios');

async function testHealthCheck() {
  const baseUrl = process.env.API_URL || 'http://localhost:3001';
  const healthCheckUrl = `${baseUrl}/api/health`;
  
  console.log(`Testing health check endpoint at: ${healthCheckUrl}`);
  
  try {
    const response = await axios.get(healthCheckUrl);
    console.log('✅ Health check successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Health check failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Server might be down.');
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

// Run the test
testHealthCheck()
  .then(success => {
    if (!success) {
      process.exit(1); // Exit with error code if health check fails
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });