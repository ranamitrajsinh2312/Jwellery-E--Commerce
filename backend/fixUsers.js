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

// Fix user passwords
const fixUsers = async () => {
  try {
    console.log('🔧 Fixing user credentials...\n');

    // Delete existing users
    await User.deleteMany({});
    console.log('✅ Cleared existing users');

    // Create admin user (password will be hashed automatically by pre-save hook)
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@jewelry.com',
      password: 'admin123', // Plain text - will be hashed by pre-save hook
      isAdmin: true
    });
    await adminUser.save();
    console.log('✅ Admin user created');

    // Create test user (password will be hashed automatically by pre-save hook)
    const testUser = new User({
      name: 'Test User',
      email: 'user@test.com',
      password: 'password123', // Plain text - will be hashed by pre-save hook
      isAdmin: false
    });
    await testUser.save();
    console.log('✅ Test user created');

    // Verify passwords work
    const adminCheck = await User.findOne({ email: 'admin@jewelry.com' });
    const userCheck = await User.findOne({ email: 'user@test.com' });

    const adminPasswordMatch = await adminCheck.matchPassword('admin123');
    const userPasswordMatch = await userCheck.matchPassword('password123');

    console.log(`\n🔍 Password verification:`);
    console.log(`Admin password match: ${adminPasswordMatch}`);
    console.log(`User password match: ${userPasswordMatch}`);

    if (adminPasswordMatch && userPasswordMatch) {
      console.log('\n🎉 Users fixed successfully!\n');
      
      console.log('📋 WORKING CREDENTIALS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👤 ADMIN LOGIN:');
      console.log('   Email: admin@jewelry.com');
      console.log('   Password: admin123');
      console.log('   URL: http://localhost:5173/admin/login');
      console.log('');
      console.log('👤 USER LOGIN:');
      console.log('   Email: user@test.com');
      console.log('   Password: password123');
      console.log('   URL: http://localhost:5173/login');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n🚀 You can now login with these credentials!');
    } else {
      console.log('❌ Password verification failed');
    }

  } catch (error) {
    console.error('❌ Error fixing users:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the script
const runScript = async () => {
  await connectDB();
  await fixUsers();
};

runScript();