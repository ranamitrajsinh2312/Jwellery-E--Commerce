const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const API_BASE = 'http://localhost:5001/api';

// Test data
const testUser = {
  email: 'testuser@example.com',
  password: 'password123',
  name: 'Test User'
};

let userToken = '';
let testProductId = '';

async function createTestOrder() {
  console.log('🚀 Creating test order...\n');

  try {
    // 1. Login or create test user
    console.log('1. Logging in as test user...');
    try {
      const userLogin = await axios.post(`${API_BASE}/users/login`, testUser);
      userToken = userLogin.data.token;
      console.log('✅ User login successful');
    } catch (error) {
      // If user doesn't exist, create one
      console.log('User not found, creating new user...');
      await axios.post(`${API_BASE}/users/register`, testUser);
      const userLogin = await axios.post(`${API_BASE}/users/login`, testUser);
      userToken = userLogin.data.token;
      console.log('✅ User created and logged in');
    }

    // 2. Get a product to order
    console.log('\n2. Getting products...');
    const productsResponse = await axios.get(`${API_BASE}/products`);
    const products = productsResponse.data;
    
    if (products.length === 0) {
      console.log('❌ No products found. Please add some products first.');
      return;
    }
    
    const testProduct = products[0];
    testProductId = testProduct._id;
    console.log(`✅ Found product: ${testProduct.name} (Stock: ${testProduct.stock})`);

    // 3. Create test order
    console.log('\n3. Creating test order...');
    const orderData = {
      orderItems: [{
        product: testProductId,
        name: testProduct.name,
        quantity: 1,
        price: testProduct.price,
        image: testProduct.images?.[0] || 'test-image.jpg'
      }],
      shippingAddress: {
        street: '123 Test Street',
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country'
      },
      paymentMethod: 'Credit Card',
      totalPrice: testProduct.price
    };

    const orderResponse = await axios.post(`${API_BASE}/orders`, orderData, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    const orderId = orderResponse.data._id;
    console.log(`✅ Test order created successfully!`);
    console.log(`Order ID: ${orderId}`);
    console.log(`Total: $${orderResponse.data.totalPrice}`);

    // 4. Verify order was created
    console.log('\n4. Verifying order...');
    const myOrdersResponse = await axios.get(`${API_BASE}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    console.log(`✅ User has ${myOrdersResponse.data.length} order(s)`);

    console.log('\n🎉 Test order created successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Order ID: ${orderId}`);
    console.log(`- Product: ${testProduct.name}`);
    console.log(`- Total: $${testProduct.price}`);
    console.log(`- Status: ${orderResponse.data.status}`);
    
    console.log('\n🔗 You can now check the admin panel to see this order!');
    console.log('Admin Login: http://localhost:5173/admin/login');
    console.log('Email: admin@jewelry.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
createTestOrder();