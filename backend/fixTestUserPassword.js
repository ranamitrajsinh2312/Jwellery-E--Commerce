const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

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

// Fix test user password by updating directly in database
const fixTestUserPassword = async () => {
  try {
    const email = 'test@example.com';
    const password = 'test123';
    
    console.log('\n🔧 Fixing Test User Password:');
    console.log('============================');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    // Hash password manually
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update directly in database to avoid pre-save hook
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: email },
      { $set: { password: hashedPassword } }
    );
    
    if (result.matchedCount > 0) {
      console.log('✅ Test user password updated successfully!');
      
      // Verify the password works
      const user = await mongoose.connection.db.collection('users').findOne({ email: email });
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      console.log(`🔑 Password verification: ${isPasswordValid ? '✅ Valid' : '❌ Invalid'}`);
      
      if (isPasswordValid) {
        console.log('\n🎉 Test user login should work now!');
        console.log('Try logging in with:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
      }
    } else {
      console.log('❌ Test user not found! Creating new test user...');
      
      // Create new test user
      const newUser = {
        name: 'Test User',
        email: email,
        password: hashedPassword,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await mongoose.connection.db.collection('users').insertOne(newUser);
      console.log('✅ New test user created successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error fixing test user password:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the script
const runScript = async () => {
  await connectDB();
  await fixTestUserPassword();
};


runScript();


