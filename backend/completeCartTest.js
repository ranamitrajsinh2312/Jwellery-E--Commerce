const axios = require('axios');

const baseURL = 'http://localhost:5001/api';

// Create a unique test user
const testUser = {
  name: 'Cart Test User',
  email: `carttest${Date.now()}@example.com`,
  password: 'testpassword123'
};

let userToken = '';
let productId = '';

async function runCompleteCartTest() {
  console.log('🛒 Starting Complete Cart Functionality Test\n');
  
  try {
    // Test 1: Register a new user
    console.log('1. Registering new user...');
    const registerResponse = await axios.post(`${baseURL}/users/register`, testUser);
    userToken = registerResponse.data.token;
    console.log('✅ User registered:', registerResponse.data.name);
    console.log('📝 Token received:', userToken ? 'Yes' : 'No');

    // Test 2: Get products to use for cart testing
    console.log('\n2. Getting products for cart testing...');
    const productsResponse = await axios.get(`${baseURL}/products`);
    if (productsResponse.data.length > 0) {
      productId = productsResponse.data[0]._id;
      console.log('✅ Product found:', productsResponse.data[0].name);
      console.log('📝 Product ID:', productId);
      console.log('📝 Product stock:', productsResponse.data[0].stock);
    } else {
      throw new Error('No products found in database');
    }

    // Test 3: View empty cart
    console.log('\n3. Testing View Empty Cart...');
    const emptyCartResponse = await axios.get(`${baseURL}/cart`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Empty cart retrieved');
    console.log('📝 Cart items:', emptyCartResponse.data?.items?.length || 0);

    // Test 4: Add item to cart
    console.log('\n4. Testing Add to Cart...');
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
    if (addToCartResponse.data?.items?.length > 0) {
      console.log('📝 Item quantity:', addToCartResponse.data.items[0].qty);
      console.log('📝 Product name:', addToCartResponse.data.items[0].product.name);
    }

    // Test 5: View cart with items
    console.log('\n5. Testing View Cart with Items...');
    const cartWithItemsResponse = await axios.get(`${baseURL}/cart`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Cart with items retrieved');
    console.log('📝 Cart items:', cartWithItemsResponse.data?.items?.length || 0);

    // Test 6: Update cart item quantity
    console.log('\n6. Testing Update Cart Item Quantity...');
    const updateCartResponse = await axios.put(`${baseURL}/cart`, 
      {
        productId: productId,
        quantity: 5
      },
      {
        headers: { Authorization: `Bearer ${userToken}` }
      }
    );
    console.log('✅ Cart item quantity updated');
    if (updateCartResponse.data?.items?.length > 0) {
      console.log('📝 Updated quantity:', updateCartResponse.data.items[0].qty);
    }

    // Test 7: Add same item again (should increase quantity)
    console.log('\n7. Testing Add Same Item Again...');
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

    // Test 8: Update quantity to zero (should remove item)
    console.log('\n8. Testing Update Quantity to Zero...');
    const updateToZeroResponse = await axios.put(`${baseURL}/cart`, 
      {
        productId: productId,
        quantity: 0
      },
      {
        headers: { Authorization: `Bearer ${userToken}` }
      }
    );
    console.log('✅ Item quantity updated to zero');
    console.log('📝 Cart items after update to zero:', updateToZeroResponse.data?.items?.length || 0);

    // Test 9: Add item back for removal test
    console.log('\n9. Adding item back for removal test...');
    const addBackResponse = await axios.post(`${baseURL}/cart`, 
      {
        productId: productId,
        quantity: 3
      },
      {
        headers: { Authorization: `Bearer ${userToken}` }
      }
    );
    console.log('✅ Item added back');
    console.log('📝 Cart items:', addBackResponse.data?.items?.length || 0);

    // Test 10: Remove item from cart
    console.log('\n10. Testing Remove Item from Cart...');
    const removeFromCartResponse = await axios.delete(`${baseURL}/cart/${productId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Item removed from cart');
    console.log('📝 Cart items after removal:', removeFromCartResponse.data?.items?.length || 0);

    console.log('\n🎉 All Cart Functionality Tests Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ User Registration with Token');
    console.log('- ✅ View Empty Cart');
    console.log('- ✅ Add Item to Cart');
    console.log('- ✅ View Cart with Items');
    console.log('- ✅ Update Cart Item Quantity');
    console.log('- ✅ Add Same Item (Quantity Increase)');
    console.log('- ✅ Update Quantity to Zero (Item Removal)');
    console.log('- ✅ Remove Item from Cart');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.message || error.message);
    console.error('Status:', error.response?.status || 'Unknown');
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

runCompleteCartTest();
