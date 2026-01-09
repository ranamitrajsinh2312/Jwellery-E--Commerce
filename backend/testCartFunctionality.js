const axios = require('axios');

const baseURL = 'http://localhost:5001/api';

// Test user data
const testUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'testpassword123'
};

let userToken = '';
let productId = '';

async function runTests() {
  console.log('🚀 Starting Cart Functionality Tests\n');

  try {
    // Test 1: Register a new user
    console.log('1. Testing User Registration...');
    try {
      const registerResponse = await axios.post(`${baseURL}/users/register`, testUser);
      userToken = registerResponse.data.token;
      console.log('✅ User registered successfully');
      console.log('📝 Token received:', userToken ? 'Yes' : 'No');
    } catch (error) {
      if (error.response?.data?.message === 'User already exists') {
        console.log('⚠️ User already exists, trying login...');
        
        // Test 2: Login with existing user
        console.log('2. Testing User Login...');
        const loginResponse = await axios.post(`${baseURL}/users/login`, {
          email: testUser.email,
          password: testUser.password
        });
        userToken = loginResponse.data.token;
        console.log('✅ User logged in successfully');
        console.log('📝 Token received:', userToken ? 'Yes' : 'No');
      } else {
        throw error;
      }
    }

    // Test 3: Get user profile
    console.log('\n3. Testing Get User Profile...');
    const profileResponse = await axios.get(`${baseURL}/users/profile`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ User profile retrieved:', profileResponse.data.user?.name || 'Unknown');

    // Test 4: Get products to test cart functionality
    console.log('\n4. Getting Products for Cart Testing...');
    const productsResponse = await axios.get(`${baseURL}/products`);
    if (productsResponse.data.length > 0) {
      productId = productsResponse.data[0]._id;
      console.log('✅ Product found:', productsResponse.data[0].name);
      console.log('📝 Product ID:', productId);
    } else {
      throw new Error('No products found in database');
    }

    // Test 5: View empty cart
    console.log('\n5. Testing View Empty Cart...');
    const emptyCartResponse = await axios.get(`${baseURL}/cart`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Empty cart retrieved');
    console.log('📝 Cart items:', emptyCartResponse.data?.items?.length || 0);

    // Test 6: Add item to cart
    console.log('\n6. Testing Add to Cart...');
    const addToCartResponse = await axios.post(`${baseURL}/cart`, 
      {
        productId: productId,
        quantity: 2
      },
      {
        headers: { Authorization: `Bearer ${userToken}` }
      }
    );
    console.log('✅ Item added to cart');
    console.log('📝 Cart items after adding:', addToCartResponse.data?.items?.length || 0);

    // Test 7: View cart with items
    console.log('\n7. Testing View Cart with Items...');
    const cartWithItemsResponse = await axios.get(`${baseURL}/cart`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Cart with items retrieved');
    console.log('📝 Cart items:', cartWithItemsResponse.data?.items?.length || 0);
    if (cartWithItemsResponse.data?.items?.length > 0) {
      console.log('📝 First item quantity:', cartWithItemsResponse.data.items[0].qty);
    }

    // Test 8: Update cart item quantity
    console.log('\n8. Testing Update Cart Item Quantity...');
    const updateCartResponse = await axios.put(`${baseURL}/cart`, 
      {
        productId: productId,
        quantity: 3
      },
      {
        headers: { Authorization: `Bearer ${userToken}` }
      }
    );
    console.log('✅ Cart item quantity updated');
    if (updateCartResponse.data?.items?.length > 0) {
      console.log('📝 Updated quantity:', updateCartResponse.data.items[0].qty);
    }

    // Test 9: Add same item again (should increase quantity)
    console.log('\n9. Testing Add Same Item Again...');
    const addSameItemResponse = await axios.post(`${baseURL}/cart`, 
      {
        productId: productId,
        quantity: 1
      },
      {
        headers: { Authorization: `Bearer ${userToken}` }
      }
    );
    console.log('✅ Same item added again');
    if (addSameItemResponse.data?.items?.length > 0) {
      console.log('📝 Total quantity now:', addSameItemResponse.data.items[0].qty);
    }

    // Test 10: Remove item from cart
    console.log('\n10. Testing Remove Item from Cart...');
    const removeFromCartResponse = await axios.delete(`${baseURL}/cart/${productId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Item removed from cart');
    console.log('📝 Cart items after removal:', removeFromCartResponse.data?.items?.length || 0);

    console.log('\n🎉 All Cart Functionality Tests Completed Successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.message || error.message);
    console.error('Status:', error.response?.status || 'Unknown');
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the tests
runTests();
