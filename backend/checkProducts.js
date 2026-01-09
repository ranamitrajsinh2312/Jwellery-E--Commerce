const mongoose = require('mongoose');
const Product = require('./models/Product');

async function checkProducts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/jewelry_shop');
    console.log('Connected to MongoDB');
    
    const products = await Product.find().limit(3);
    console.log('Found', products.length, 'products');
    products.forEach((product, index) => {
      console.log(`\nProduct ${index + 1}:`);
      console.log('Name:', product.name);
      console.log('Images field exists:', 'images' in product);
      console.log('Images value:', product.images);
      console.log('Images type:', typeof product.images);
      console.log('Is array:', Array.isArray(product.images));
      console.log('Images length:', product.images?.length);
      if (product.images && product.images.length > 0) {
        console.log('First image:', product.images[0]);
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProducts();
