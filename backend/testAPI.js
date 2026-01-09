const axios = require('axios');

// Test API endpoints
const testAPI = async () => {
  const baseURL = 'http://localhost:5001/api';
  
  console.log('\n🧪 Testing API Endpoints:');
  console.log('==========================');
  
  try {
    // Test 1: Check if server is running
    console.log('\n1️⃣ Testing server connection...');
    try {
      const response = await axios.get(`${baseURL}/products`);
      console.log('✅ Server is running and responding');
    } catch (error) {
      console.log('❌ Server not responding:', error.message);
      return;
    }
    
    // Test 2: Test admin login API
    console.log('\n2️⃣ Testing admin login API...');
    try {
      const adminLoginData = {
        email: 'admin@jewelry.com',
        password: 'admin123'
      };
      
      const adminResponse = await axios.post(`${baseURL}/users/login`, adminLoginData);
      console.log('✅ Admin login API working');
      console.log('Response:', {
        _id: adminResponse.data._id,
        name: adminResponse.data.name,
        email: adminResponse.data.email,
        isAdmin: adminResponse.data.isAdmin,
        hasToken: !!adminResponse.data.token
      });
    } catch (error) {
      console.log('❌ Admin login API failed:', error.response?.data || error.message);
    }
    
    // Test 3: Test regular user login API
    console.log('\n3️⃣ Testing regular user login API...');
    try {
      const userLoginData = {
        email: 'test@example.com',
        password: 'test123'
      };
      
      const userResponse = await axios.post(`${baseURL}/users/login`, userLoginData);
      console.log('✅ Regular user login API working');
      console.log('Response:', {
        _id: userResponse.data._id,
        name: userResponse.data.name,
        email: userResponse.data.email,
        isAdmin: userResponse.data.isAdmin,
        hasToken: !!userResponse.data.token
      });
    } catch (error) {
      console.log('❌ Regular user login API failed:', error.response?.data || error.message);
    }
    
    // Test 4: Test registration API
    console.log('\n4️⃣ Testing registration API...');
    try {
      const registerData = {
        name: 'Test Register User',
        email: 'register@test.com',
        password: 'test123'
      };
      
      const registerResponse = await axios.post(`${baseURL}/users/register`, registerData);
      console.log('✅ Registration API working');
      console.log('Response:', {
        _id: registerResponse.data._id,
        name: registerResponse.data.name,
        email: registerResponse.data.email
      });
    } catch (error) {
      console.log('❌ Registration API failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ General API test error:', error.message);
  }
};

// Run the test
testAPI();
