const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const createTestUser = async () => {
  try {
    // First, remove existing test user if exists
    await User.deleteOne({ email: 'ordertest@example.com' });
    
    const user = new User({
      name: 'Order Test User',
      email: 'ordertest@example.com',
      password: 'password123'
    });

    await user.save();
    console.log('Test user created with email: ordertest@example.com and password: password123');
    console.log('User ID:', user._id);
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    mongoose.connection.close();
  }
};

const runScript = async () => {
  await connectDB();
  await createTestUser();
};

runScript();
