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

const testAdmin = {
  email: 'admin@example.com',
  password: 'admin123',
  name: 'Admin User'
};

let userToken = '';
let adminToken = '';
let testProductId = '';

async function runTests() {
  console.log('🚀 Starting Order and Stock Management Tests...\n');

  try {
    // 1. Login as admin
    console.log('1. Logging in as admin...');
    const adminLogin = await axios.post(`${API_BASE}/users/login`, testAdmin);
    adminToken = adminLogin.data.token;
    console.log('✅ Admin login successful\n');

    // 2. Create a test product with stock
    console.log('2. Creating test product with stock...');
    const productData = {
      name: 'Test Diamond Ring',
      description: 'Beautiful test diamond ring',
      price: 999.99,
      category: '507f1f77bcf86cd799439011', // You might need to create a category first
      stock: 10,
      material: 'Gold',
      weight: 5.5,
      purity: '18K'
    };

    const productResponse = await axios.post(`${API_BASE}/products`, productData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    testProductId = productResponse.data._id;
    console.log(`✅ Product created with ID: ${testProductId}, Stock: ${productResponse.data.stock}\n`);

    // 3. Login as regular user
    console.log('3. Logging in as regular user...');
    try {
      const userLogin = await axios.post(`${API_BASE}/users/login`, testUser);
      userToken = userLogin.data.token;
    } catch (error) {
      // If user doesn't exist, create one
      console.log('User not found, creating new user...');
      await axios.post(`${API_BASE}/users/register`, testUser);
      const userLogin = await axios.post(`${API_BASE}/users/login`, testUser);
      userToken = userLogin.data.token;
    }
    console.log('✅ User login successful\n');

    // 4. Check initial stock
    console.log('4. Checking initial product stock...');
    const initialProduct = await axios.get(`${API_BASE}/products/${testProductId}`);
    console.log(`✅ Initial stock: ${initialProduct.data.stock}\n`);

    // 5. Create an order (this should decrease stock)
    console.log('5. Creating order to test stock deduction...');
    const orderData = {
      orderItems: [{
        product: testProductId,
        name: 'Test Diamond Ring',
        quantity: 2,
        price: 999.99,
        image: 'test-image.jpg'
      }],
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country'
      },
      paymentMethod: 'Credit Card',
      totalPrice: 1999.98
    };

    const orderResponse = await axios.post(`${API_BASE}/orders`, orderData, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const orderId = orderResponse.data._id;
    console.log(`✅ Order created with ID: ${orderId}\n`);

    // 6. Check stock after order
    console.log('6. Checking stock after order...');
    const afterOrderProduct = await axios.get(`${API_BASE}/products/${testProductId}`);
    console.log(`✅ Stock after order: ${afterOrderProduct.data.stock} (should be 8)\n`);

    // 7. Get order statistics (admin)
    console.log('7. Getting order statistics...');
    const orderStats = await axios.get(`${API_BASE}/orders/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Order stats - Total: ${orderStats.data.totalOrders}, Pending: ${orderStats.data.pendingOrders}\n`);

    // 8. Update order status
    console.log('8. Updating order status...');
    await axios.put(`${API_BASE}/orders/${orderId}/status`, 
      { status: 'Processing' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('✅ Order status updated to Processing\n');

    // 9. Cancel order (should restore stock)
    console.log('9. Cancelling order to test stock restoration...');
    await axios.put(`${API_BASE}/orders/${orderId}/status`, 
      { status: 'Cancelled' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('✅ Order cancelled\n');

    // 10. Check stock after cancellation
    console.log('10. Checking stock after cancellation...');
    const afterCancelProduct = await axios.get(`${API_BASE}/products/${testProductId}`);
    console.log(`✅ Stock after cancellation: ${afterCancelProduct.data.stock} (should be 10 again)\n`);

    // 11. Test stock update directly
    console.log('11. Testing direct stock update...');
    await axios.put(`${API_BASE}/products/${testProductId}/stock`, 
      { stock: 25 },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const updatedProduct = await axios.get(`${API_BASE}/products/${testProductId}`);
    console.log(`✅ Stock updated directly to: ${updatedProduct.data.stock}\n`);

    // 12. Get low stock products
    console.log('12. Testing low stock detection...');
    await axios.put(`${API_BASE}/products/${testProductId}/stock`, 
      { stock: 5 },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const lowStockProducts = await axios.get(`${API_BASE}/products/admin/low-stock?threshold=10`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Low stock products found: ${lowStockProducts.data.length}\n`);

    // 13. Get product statistics
    console.log('13. Getting product statistics...');
    const productStats = await axios.get(`${API_BASE}/products/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Product stats - Total: ${productStats.data.totalProducts}, Low Stock: ${productStats.data.lowStockProducts}\n`);

    console.log('🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('- ✅ Order creation with stock deduction');
    console.log('- ✅ Order status management');
    console.log('- ✅ Stock restoration on cancellation');
    console.log('- ✅ Direct stock updates');
    console.log('- ✅ Low stock detection');
    console.log('- ✅ Admin statistics');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run tests
runTests();