const axios = require('axios');

const testOrdersAPI = async () => {
  try {
    // First, login to get a token
    console.log('Testing login...');
    const loginResponse = await axios.post('http://localhost:5001/api/users/login', {
      email: 'ordertest@example.com', // Using the new test user
      password: 'password123'
    });
    
    console.log('Login successful');
    const token = loginResponse.data.token;
    
    // Test fetching orders
    console.log('Testing orders API...');
    const ordersResponse = await axios.get('http://localhost:5001/api/orders/my-orders', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Orders fetched:', ordersResponse.data);
    console.log('Number of orders:', ordersResponse.data.length);
    
  } catch (error) {
    if (error.response) {
      console.error('HTTP Error:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    console.error('Full error:', error);
  }
};

testOrdersAPI();
