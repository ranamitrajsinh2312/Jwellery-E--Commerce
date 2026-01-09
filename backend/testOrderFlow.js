const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testOrderFlow() {
  console.log('🛒 Testing Complete Order Flow...\n');

  try {
    // 1. Login as user
    console.log('1. Logging in as user...');
    const userLogin = await axios.post(`${API_BASE}/users/login`, {
      email: 'user@test.com',
      password: 'password123'
    });
    const userToken = userLogin.data.token;
    console.log('✅ User logged in successfully');

    // 2. Login as admin
    console.log('\n2. Logging in as admin...');
    const adminLogin = await axios.post(`${API_BASE}/users/login`, {
      email: 'admin@jewelry.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.token;
    console.log('✅ Admin logged in successfully');

    // 3. Get products and check initial stock
    console.log('\n3. Getting products and checking stock...');
    const productsResponse = await axios.get(`${API_BASE}/products`);
    const products = productsResponse.data;
    const testProduct = products[0];
    console.log(`Product: ${testProduct.name}`);
    console.log(`Initial Stock: ${testProduct.stock}`);
    console.log(`Price: $${testProduct.price}`);

    // 4. Check initial orders count
    console.log('\n4. Checking initial orders...');
    const initialOrdersResponse = await axios.get(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`Initial orders count: ${initialOrdersResponse.data.length}`);

    // 5. Create order as user
    console.log('\n5. Creating order as user...');
    const orderData = {
      orderItems: [{
        product: testProduct._id,
        name: testProduct.name,
        quantity: 2,
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
      totalPrice: testProduct.price * 2
    };

    const orderResponse = await axios.post(`${API_BASE}/orders`, orderData, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    console.log('✅ Order created successfully!');
    console.log(`Order ID: ${orderResponse.data._id}`);
    console.log(`Order Status: ${orderResponse.data.status}`);
    console.log(`Order Total: $${orderResponse.data.totalPrice}`);

    // 6. Check stock after order
    console.log('\n6. Checking stock after order...');
    const updatedProductResponse = await axios.get(`${API_BASE}/products/${testProduct._id}`);
    const updatedProduct = updatedProductResponse.data;
    console.log(`Stock after order: ${updatedProduct.stock}`);
    console.log(`Stock change: ${testProduct.stock} → ${updatedProduct.stock} (${updatedProduct.stock - testProduct.stock})`);

    // 7. Check orders from admin side
    console.log('\n7. Checking orders from admin side...');
    const finalOrdersResponse = await axios.get(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`Final orders count: ${finalOrdersResponse.data.length}`);
    console.log(`New orders: ${finalOrdersResponse.data.length - initialOrdersResponse.data.length}`);

    // 8. Get order statistics
    console.log('\n8. Getting order statistics...');
    const statsResponse = await axios.get(`${API_BASE}/orders/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`Total Orders: ${statsResponse.data.totalOrders}`);
    console.log(`Pending Orders: ${statsResponse.data.pendingOrders}`);
    console.log(`Total Revenue: $${statsResponse.data.totalRevenue}`);

    // 9. Show recent orders
    if (finalOrdersResponse.data.length > 0) {
      console.log('\n9. Recent orders:');
      finalOrdersResponse.data.slice(0, 3).forEach((order, index) => {
        console.log(`   ${index + 1}. Order #${order._id.slice(-8)} - $${order.totalPrice} - ${order.status}`);
      });
    }

    console.log('\n🎉 Order flow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Order created: ${orderResponse.data._id}`);
    console.log(`- Stock updated: ${testProduct.stock} → ${updatedProduct.stock}`);
    console.log(`- Admin can see: ${finalOrdersResponse.data.length} orders`);
    console.log(`- Order visible in admin: ${finalOrdersResponse.data.some(o => o._id === orderResponse.data._id) ? 'YES' : 'NO'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

testOrderFlow();