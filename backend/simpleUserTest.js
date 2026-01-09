const axios = require('axios');

const baseURL = 'http://localhost:5001/api';

// Create a unique test user
const testUser = {
  name: 'New Test User',
  email: `newtest${Date.now()}@example.com`,
  password: 'testpassword123'
};

async function runUserTest() {
  console.log('Testing User Registration and Login...\n');
  
  try {
    // Test 1: Register a new user
    console.log('1. Registering new user:', testUser.email);
    const registerResponse = await axios.post(`${baseURL}/users/register`, testUser);
    console.log('✅ User registered successfully');
    console.log('Response:', registerResponse.data);
    
    if (registerResponse.data.token) {
      console.log('✅ Token received on registration');
      
      // Test 2: Use the token to get profile
      console.log('\n2. Testing profile access with token...');
      const profileResponse = await axios.get(`${baseURL}/users/profile`, {
        headers: { Authorization: `Bearer ${registerResponse.data.token}` }
      });
      console.log('✅ Profile accessed successfully');
      console.log('Profile data:', profileResponse.data);
    } else {
      console.log('❌ No token received');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    console.error('Status:', error.response?.status || 'Unknown');
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

runUserTest();
