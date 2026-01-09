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

// Test both logins
const testBothLogins = async () => {
  try {
    console.log('\n🧪 Testing Both Login Types:');
    console.log('============================');
    
    // Test Admin Login
    console.log('\n🔐 Testing Admin Login:');
    console.log('------------------------');
    const adminEmail = 'admin@jewelry.com';
    const adminPassword = 'admin123';
    
    const adminUser = await User.findOne({ email: adminEmail });
    if (adminUser) {
      const adminPasswordValid = await bcrypt.compare(adminPassword, adminUser.password);
      console.log(`✅ Admin user found: ${adminUser.name}`);
      console.log(`🔑 Admin password: ${adminPasswordValid ? '✅ Valid' : '❌ Invalid'}`);
      console.log(`👑 Admin status: ${adminUser.isAdmin ? '✅ Admin' : '❌ Not Admin'}`);
    } else {
      console.log('❌ Admin user not found!');
    }
    
    // Test Regular User Login
    console.log('\n👤 Testing Regular User Login:');
    console.log('--------------------------------');
    const userEmail = 'test@example.com';
    const userPassword = 'test123';
    
    const regularUser = await User.findOne({ email: userEmail });
    if (regularUser) {
      const userPasswordValid = await bcrypt.compare(userPassword, regularUser.password);
      console.log(`✅ Regular user found: ${regularUser.name}`);
      console.log(`🔑 User password: ${userPasswordValid ? '✅ Valid' : '❌ Invalid'}`);
      console.log(`👑 Admin status: ${regularUser.isAdmin ? '❌ Admin (should be false)' : '✅ Regular User'}`);
    } else {
      console.log('❌ Regular user not found!');
    }
    
    console.log('\n🎉 Login Test Summary:');
    console.log('=====================');
    console.log('✅ Both users should be able to log in now!');
    console.log('\n📋 Login URLs:');
    console.log('Admin Login: http://localhost:5173/admin/login');
    console.log('Regular Login: http://localhost:5173/login');
    
  } catch (error) {
    console.error('❌ Error testing logins:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the script
const runScript = async () => {
  await connectDB();
  await testBothLogins();
};

runScript();
