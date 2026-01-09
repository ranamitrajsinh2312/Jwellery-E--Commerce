const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('./models/Product');
const Category = require('./models/Category');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Sample categories
const categories = [
  { name: 'Rings' },
  { name: 'Necklaces' },
  { name: 'Earrings' },
  { name: 'Bracelets' },
  { name: 'Watches' }
];

// Sample products
const products = [
  {
    name: 'Diamond Ring',
    description: 'Beautiful 18k gold diamond ring with 1 carat center stone',
    price: 2999.99,
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400'],
    category: null, // Will be set after categories are created
    stock: 10,
    material: '18k Gold',
    weight: 3.5,
    dimensions: 'Size 7'
  },
  {
    name: 'Pearl Necklace',
    description: 'Elegant freshwater pearl necklace with sterling silver clasp',
    price: 299.99,
    images: ['https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400'],
    category: null,
    stock: 25,
    material: 'Freshwater Pearls',
    weight: 15.0,
    dimensions: '18 inches'
  },
  {
    name: 'Gold Earrings',
    description: 'Classic 14k gold stud earrings perfect for everyday wear',
    price: 199.99,
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400'],
    category: null,
    stock: 30,
    material: '14k Gold',
    weight: 2.1,
    dimensions: '6mm'
  },
  {
    name: 'Silver Bracelet',
    description: 'Sterling silver bracelet with intricate design',
    price: 149.99,
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400'],
    category: null,
    stock: 20,
    material: 'Sterling Silver',
    weight: 8.5,
    dimensions: '7.5 inches'
  },
  {
    name: 'Luxury Watch',
    description: 'Premium automatic watch with leather strap',
    price: 899.99,
    images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400'],
    category: null,
    stock: 5,
    material: 'Stainless Steel',
    weight: 85.0,
    dimensions: '42mm'
  }
];

// Seed data function
const seedData = async () => {
  try {
    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    
    console.log('🗑️ Cleared existing data');
    
    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log('✅ Categories created:', createdCategories.length);
    
    // Create products with category references
    const productsWithCategories = products.map((product, index) => ({
      ...product,
      category: createdCategories[index % createdCategories.length]._id
    }));
    
    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log('✅ Products created:', createdProducts.length);
    
    console.log('\n📊 Sample Data Summary:');
    console.log(`Categories: ${createdCategories.length}`);
    console.log(`Products: ${createdProducts.length}`);
    console.log('\n🎉 Database seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the script
const runScript = async () => {
  await connectDB();
  await seedData();
};

runScript();
