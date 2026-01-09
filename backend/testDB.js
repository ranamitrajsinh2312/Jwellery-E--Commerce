// Test database connection
process.env.MONGO_URI = 'mongodb+srv://jewelry:jewelry123@cluster0.xamohdt.mongodb.net/jewelry_shop?retryWrites=true&w=majority';

const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('🔌 Testing MongoDB connection...');
    console.log('URI:', process.env.MONGO_URI);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Test a simple query
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    console.log(`📊 Users in database: ${userCount}`);
    
    mongoose.connection.close();
    console.log('🔌 Connection closed');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
};

testConnection();
