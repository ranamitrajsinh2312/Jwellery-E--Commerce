const mongoose = require('mongoose');
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

const cleanupCartData = async () => {
  try {
    // Remove all existing cart data to start fresh
    const deleteResult = await mongoose.connection.db.collection('carts').deleteMany({});
    console.log('Deleted carts:', deleteResult.deletedCount);
    
    console.log('Cart cleanup completed');
    
  } catch (error) {
    console.error('Cleanup error:', error);
  } finally {
    mongoose.connection.close();
  }
};

const run = async () => {
  await connectDB();
  await cleanupCartData();
};

run();
