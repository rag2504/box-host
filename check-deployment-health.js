// Script to check if the deployed API is healthy
import axios from 'axios';

const API_URL = 'https://boxcric-api.onrender.com/api/health';

console.log('🔍 BoxCric Deployment Health Check');
console.log('==================================');
console.log(`Testing connection to ${API_URL}...\n`);

axios.get(API_URL)
  .then(response => {
    console.log('✅ API Health Check: SUCCESS');
    console.log('Response Data:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check MongoDB connection
    if (response.data.mongoConnected) {
      console.log('\n✅ MongoDB Connection: SUCCESS');
    } else {
      console.log('\n❌ MongoDB Connection: FAILED');
      console.log('Please check your MongoDB connection string in Render environment variables.');
    }
    
    console.log('\n🔍 Additional Checks:');
    console.log(`- Timestamp: ${response.data.timestamp}`);
    console.log(`- Status: ${response.data.status}`);
    
    console.log('\n✨ Your BoxCric API is running successfully!');
  })
  .catch(error => {
    console.error('❌ API Health Check: FAILED');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from the server.');
      console.error('This could indicate that:');
      console.error('1. The server is not running');
      console.error('2. The server URL is incorrect');
      console.error('3. There is a network issue');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
    
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Check if your Render service is deployed and running');
    console.log('2. Verify that the health check endpoint is correctly implemented');
    console.log('3. Check your Render logs for any errors');
    console.log('4. Ensure all environment variables are correctly set in Render');
  });