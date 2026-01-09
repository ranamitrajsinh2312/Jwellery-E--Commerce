const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

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

// Sample data
const sampleCategories = [
  { name: 'Rings', description: 'Beautiful rings for all occasions' },
  { name: 'Necklaces', description: 'Elegant necklaces and chains' },
  { name: 'Earrings', description: 'Stunning earrings collection' },
  { name: 'Bracelets', description: 'Stylish bracelets and bangles' },
  { name: 'Pendants', description: 'Gorgeous pendants and charms' }
];

const sampleProducts = [
  {
    name: 'Diamond Solitaire Ring',
    description: 'Elegant diamond solitaire ring in 18K white gold',
    price: 2999.99,
    discountPrice: 2499.99,
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400'],
    material: 'White Gold',
    weight: 3.5,
    purity: '18K',
    stock: 15,
    isFeatured: true,
    tags: ['diamond', 'engagement', 'luxury']
  },
  {
    name: 'Pearl Necklace Set',
    description: 'Classic pearl necklace with matching earrings',
    price: 899.99,
    images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'],
    material: 'Pearl',
    weight: 25.0,
    stock: 8,
    isFeatured: true,
    tags: ['pearl', 'classic', 'set']
  },
  {
    name: 'Gold Hoop Earrings',
    description: 'Stylish gold hoop earrings for everyday wear',
    price: 299.99,
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400'],
    material: 'Gold',
    weight: 4.2,
    purity: '14K',
    stock: 25,
    tags: ['gold', 'hoops', 'everyday']
  },
  {
    name: 'Silver Tennis Bracelet',
    description: 'Sparkling silver tennis bracelet with cubic zirconia',
    price: 199.99,
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400'],
    material: 'Silver',
    weight: 12.0,
    purity: '925 Sterling',
    stock: 12,
    tags: ['silver', 'tennis', 'sparkle']
  },
  {
    name: 'Rose Gold Heart Pendant',
    description: 'Romantic rose gold heart pendant with chain',
    price: 449.99,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400'],
    material: 'Rose Gold',
    weight: 2.8,
    purity: '14K',
    stock: 18,
    isFeatured: true,
    tags: ['rose gold', 'heart', 'romantic']
  },
  {
    name: 'Emerald Cut Diamond Ring',
    description: 'Stunning emerald cut diamond ring in platinum setting',
    price: 4999.99,
    discountPrice: 4299.99,
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400'],
    material: 'Platinum',
    weight: 4.1,
    purity: 'Platinum 950',
    stock: 5,
    isFeatured: true,
    tags: ['diamond', 'emerald cut', 'platinum', 'luxury']
  },
  {
    name: 'Sapphire Stud Earrings',
    description: 'Beautiful blue sapphire stud earrings in white gold',
    price: 799.99,
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400'],
    material: 'White Gold',
    weight: 2.5,
    purity: '18K',
    stock: 10,
    tags: ['sapphire', 'studs', 'blue']
  },
  {
    name: 'Vintage Gold Chain',
    description: 'Classic vintage-style gold chain necklace',
    price: 599.99,
    images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'],
    material: 'Gold',
    weight: 15.5,
    purity: '18K',
    stock: 20,
    tags: ['gold', 'vintage', 'chain']
  }
];

// Setup function
const setupDatabase = async () => {
  try {
    console.log('🚀 Setting up database...\n');

    // Clear existing data
    console.log('1. Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create admin user
    console.log('2. Creating admin user...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@jewelry.com',
      password: hashedAdminPassword,
      isAdmin: true
    });
    await adminUser.save();
    console.log('✅ Admin user created\n');

    // Create test user
    console.log('3. Creating test user...');
    const hashedUserPassword = await bcrypt.hash('password123', 10);
    const testUser = new User({
      name: 'Test User',
      email: 'user@test.com',
      password: hashedUserPassword,
      isAdmin: false
    });
    await testUser.save();
    console.log('✅ Test user created\n');

    // Create categories
    console.log('4. Creating categories...');
    const createdCategories = [];
    for (const categoryData of sampleCategories) {
      const category = new Category(categoryData);
      const savedCategory = await category.save();
      createdCategories.push(savedCategory);
    }
    console.log(`✅ ${createdCategories.length} categories created\n`);

    // Create products
    console.log('5. Creating products...');
    for (let i = 0; i < sampleProducts.length; i++) {
      const productData = {
        ...sampleProducts[i],
        category: createdCategories[i % createdCategories.length]._id
      };
      const product = new Product(productData);
      await product.save();
    }
    console.log(`✅ ${sampleProducts.length} products created\n`);

    console.log('🎉 Database setup completed successfully!\n');
    
    console.log('📋 Login Credentials:');
    console.log('👤 Admin Login:');
    console.log('   Email: admin@jewelry.com');
    console.log('   Password: admin123');
    console.log('   URL: http://localhost:5173/admin/login\n');
    
    console.log('👤 Test User Login:');
    console.log('   Email: user@test.com');
    console.log('   Password: password123');
    console.log('   URL: http://localhost:5173/login\n');
    
    console.log('🏪 Frontend URL: http://localhost:5173');
    console.log('🔧 Backend URL: http://localhost:5001');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the setup
const runSetup = async () => {
  await connectDB();
  await setupDatabase();
};

runSetup();