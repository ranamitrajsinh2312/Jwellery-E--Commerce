const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

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

// Create test user
const createTestUser = async () => {
  try {
    const testEmail = 'test@example.com';
    const testPassword = 'test123';
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: testEmail });
    
    if (existingUser) {
      // Update existing user password
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      existingUser.password = hashedPassword;
      await existingUser.save();
      console.log('✅ Test user password updated: test@example.com');
    } else {
      // Create new test user
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      const testUser = new User({
        name: 'Test User',
        email: testEmail,
        password: hashedPassword,
        isAdmin: false
      });
      
      await testUser.save();
      console.log('✅ Test user created successfully!');
    }
    
    console.log('\n📋 Test User Login Details:');
    console.log('Email: test@example.com');
    console.log('Password: test123');
    console.log('\n🔗 Regular Login URL: http://localhost:5173/login');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the script
const runScript = async () => {
  await connectDB();
  await createTestUser();
};

runScript();
