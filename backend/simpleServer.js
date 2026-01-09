const express = require('express');

// Set environment variables
process.env.JWT_SECRET = 'jewelry_shop_secret_key_2024';

const app = express();
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }
  next();
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Simple server is running!' });
});

// Test login route (without database)
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email, password });
  
  // Simple test responses
  if (email === 'admin@jewelry.com' && password === 'admin123') {
    res.json({
      _id: 'admin123',
      name: 'Admin User',
      email: 'admin@jewelry.com',
      isAdmin: true,
      token: 'test_admin_token_123'
    });
  } else if (email === 'test@example.com' && password === 'test123') {
    res.json({
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      isAdmin: false,
      token: 'test_user_token_123'
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Test products route
app.get('/api/products', (req, res) => {
  res.json([
    { _id: '1', name: 'Test Product 1', price: 100 },
    { _id: '2', name: 'Test Product 2', price: 200 }
  ]);
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log('✅ No database connection required');
  console.log('🔗 Test URLs:');
  console.log('   - http://localhost:5001/');
  console.log('   - http://localhost:5001/api/products');
  console.log('   - POST http://localhost:5001/api/users/login');
});
