const axios = require('axios');

const testCart = async () => {
  try {
    // Login first
    console.log('Testing login...');
    const loginResponse = await axios.post('http://localhost:5001/api/users/login', {
      email: 'ordertest@example.com',
      password: 'password123'
    });
    
    console.log('Login successful');
    const token = loginResponse.data.token;
    
    // Get cart
    console.log('Testing get cart...');
    const cartResponse = await axios.get('http://localhost:5001/api/cart', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Empty cart data:', JSON.stringify(cartResponse.data, null, 2));
    
    // Add a product to cart
    console.log('\nAdding product to cart...');
    const addResponse = await axios.post('http://localhost:5001/api/cart', {
      productId: '68a943a1ef2aa7a5a7f094be', // Diamond Ring
      quantity: 2
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Cart after adding:', JSON.stringify(addResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testCart();
