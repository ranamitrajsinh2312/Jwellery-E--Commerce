const axios = require('axios');

async function testCategories() {
  try {
    console.log('Testing category endpoints...');
    
    // Test getting categories
    console.log('\n1. Testing GET /api/categories');
    const getResponse = await axios.get('http://localhost:5001/api/categories');
    console.log('✅ GET categories successful:', getResponse.data.length, 'categories found');
    
    // Test admin login first
    console.log('\n2. Testing admin login');
    const loginResponse = await axios.post('http://localhost:5001/api/users/login', {
      email: 'admin@jewelry.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful, token received');
    
    // Test adding category
    console.log('\n3. Testing POST /api/categories');
    const addResponse = await axios.post('http://localhost:5001/api/categories', {
      name: 'Test Category ' + Date.now()
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Add category successful:', addResponse.data);
    
    // Test getting categories again
    console.log('\n4. Testing GET /api/categories after adding');
    const getResponse2 = await axios.get('http://localhost:5001/api/categories');
    console.log('✅ GET categories successful:', getResponse2.data.length, 'categories found');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCategories();