// Set environment variables
process.env.NODE_ENV = 'development';
process.env.PORT = '5001';
process.env.MONGO_URI = 'mongodb+srv://jewelry:jewelry123@cluster0.xamohdt.mongodb.net/jewelry_shop?retryWrites=true&w=majority';
process.env.JWT_SECRET = 'jewelry_shop_secret_key_2024';
process.env.JWT_EXPIRE = '30d';

console.log('🚀 Starting server with environment variables...');
console.log('MongoDB URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
console.log('JWT Secret:', process.env.JWT_SECRET ? 'Set' : 'Not set');

// Start the server
require('./server.js');
