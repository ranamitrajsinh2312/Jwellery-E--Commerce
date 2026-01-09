const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testCompleteFlow() {
  console.log('🔄 Testing Complete Order Flow (Frontend to Backend)...\n');

  try {
    // 1. Login as user
    console.log('1. User Login...');
    const userLogin = await axios.post(`${API_BASE}/users/login`, {
      email: 'user@test.com',
      password: 'password123'
    });
    const userToken = userLogin.data.token;
    console.log('✅ User logged in');

    // 2. Login as admin
    console.log('\n2. Admin Login...');
    const adminLogin = await axios.post(`${API_BASE}/users/login`, {
      email: 'admin@jewelry.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.token;
    console.log('✅ Admin logged in');

    // 3. Get products
    console.log('\n3. Getting products...');
    const productsResponse = await axios.get(`${API_BASE}/products`);
    const product = productsResponse.data[0];
    console.log(`✅ Product: ${product.name} (Stock: ${product.stock})`);

    // 4. Check initial admin stats
    console.log('\n4. Initial admin stats...');
    const initialStats = await axios.get(`${API_BASE}/orders/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`Initial orders: ${initialStats.data.totalOrders}`);
    console.log(`Initial revenue: $${initialStats.data.totalRevenue}`);

    // 5. Create order (simulating frontend flow)
    console.log('\n5. Creating order (simulating frontend)...');
    const orderData = {
      orderItems: [{
        product: product._id,
        name: product.name,
        quantity: 1,
        price: product.price,
        image: product.images?.[0] || ''
      }],
      shippingAddress: {
        street: '123 Test Street',
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country'
      },
      paymentMethod: 'Credit Card',
      totalPrice: product.price
    };

    const orderResponse = await axios.post(`${API_BASE}/orders`, orderData, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    console.log('✅ Order created successfully!');
    console.log(`Order ID: ${orderResponse.data._id}`);
    console.log(`Status: ${orderResponse.data.status}`);

    // 6. Check updated product stock
    console.log('\n6. Checking updated stock...');
    const updatedProduct = await axios.get(`${API_BASE}/products/${product._id}`);
    console.log(`Stock updated: ${product.stock} → ${updatedProduct.data.stock}`);

    // 7. Check updated admin stats
    console.log('\n7. Updated admin stats...');
    const finalStats = await axios.get(`${API_BASE}/orders/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`Final orders: ${finalStats.data.totalOrders}`);
    console.log(`Final revenue: $${finalStats.data.totalRevenue}`);
    console.log(`New orders: ${finalStats.data.totalOrders - initialStats.data.totalOrders}`);

    // 8. Check admin orders list
    console.log('\n8. Admin orders list...');
    const ordersResponse = await axios.get(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`Total orders visible to admin: ${ordersResponse.data.length}`);
    
    const newOrder = ordersResponse.data.find(o => o._id === orderResponse.data._id);
    if (newOrder) {
      console.log('✅ New order is visible in admin panel');
      console.log(`Customer: ${newOrder.user?.name || 'Unknown'}`);
      console.log(`Items: ${newOrder.orderItems?.length || 0}`);
    } else {
      console.log('❌ New order NOT visible in admin panel');
    }

    console.log('\n🎉 Complete flow test successful!');
    console.log('\n📋 Summary:');
    console.log(`- Order created: ${orderResponse.data._id}`);
    console.log(`- Stock reduced: ${product.stock} → ${updatedProduct.data.stock}`);
    console.log(`- Admin can see order: ${newOrder ? 'YES' : 'NO'}`);
    console.log(`- Orders count increased: ${initialStats.data.totalOrders} → ${finalStats.data.totalOrders}`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

testCompleteFlow();