const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

// Test login credentials
const adminCredentials = {
  email: 'admin@jewelry.com',
  password: 'admin123'
};

const userCredentials = {
  email: 'user@test.com',
  password: 'password123'
};

async function testLogin() {
  console.log('🔐 Testing Login System...\n');

  try {
    // Test Admin Login
    console.log('1. Testing Admin Login...');
    console.log(`Email: ${adminCredentials.email}`);
    console.log(`Password: ${adminCredentials.password}`);
    
    const adminResponse = await axios.post(`${API_BASE}/users/login`, adminCredentials);
    console.log('✅ Admin login successful!');
    console.log(`Admin Token: ${adminResponse.data.token.substring(0, 20)}...`);
    console.log(`Admin Name: ${adminResponse.data.name}`);
    console.log(`Is Admin: ${adminResponse.data.isAdmin}\n`);

    // Test User Login
    console.log('2. Testing User Login...');
    console.log(`Email: ${userCredentials.email}`);
    console.log(`Password: ${userCredentials.password}`);
    
    const userResponse = await axios.post(`${API_BASE}/users/login`, userCredentials);
    console.log('✅ User login successful!');
    console.log(`User Token: ${userResponse.data.token.substring(0, 20)}...`);
    console.log(`User Name: ${userResponse.data.name}`);
    console.log(`Is Admin: ${userResponse.data.isAdmin}\n`);

    // Test Products API
    console.log('3. Testing Products API...');
    const productsResponse = await axios.get(`${API_BASE}/products`);
    console.log(`✅ Found ${productsResponse.data.length} products\n`);

    // Test Admin Orders API
    console.log('4. Testing Admin Orders API...');
    const ordersResponse = await axios.get(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${adminResponse.data.token}` }
    });
    console.log(`✅ Found ${ordersResponse.data.length} orders\n`);

    console.log('🎉 All tests passed!\n');
    
    console.log('📋 WORKING CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 ADMIN LOGIN:');
    console.log(`   Email: ${adminCredentials.email}`);
    console.log(`   Password: ${adminCredentials.password}`);
    console.log('   URL: http://localhost:5173/admin/login');
    console.log('');
    console.log('👤 USER LOGIN:');
    console.log(`   Email: ${userCredentials.email}`);
    console.log(`   Password: ${userCredentials.password}`);
    console.log('   URL: http://localhost:5173/login');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Login test failed:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔧 Fixing login issue by recreating users...');
      
      // Try to recreate users
      try {
        await axios.post(`${API_BASE}/users/register`, {
          name: 'Admin User',
          email: 'admin@jewelry.com',
          password: 'admin123'
        });
        console.log('✅ Admin user recreated');
      } catch (regError) {
        console.log('ℹ️ Admin user already exists or registration failed');
      }

      try {
        await axios.post(`${API_BASE}/users/register`, {
          name: 'Test User',
          email: 'user@test.com',
          password: 'password123'
        });
        console.log('✅ Test user recreated');
      } catch (regError) {
        console.log('ℹ️ Test user already exists or registration failed');
      }

      console.log('\n🔄 Please run the setupDatabase.js script again:');
      console.log('   node setupDatabase.js');
    }
  }
}

testLogin();