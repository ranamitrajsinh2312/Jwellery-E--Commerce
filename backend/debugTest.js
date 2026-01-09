const axios = require('axios');

async function testConnection() {
  console.log('Testing server connection...');
  
  try {
    const response = await axios.get('http://localhost:5001/');
    console.log('✅ Server is running');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Connection failed:', error.code || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testConnection();
