const express = require('express');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorMiddleware');
const rateLimit = require('express-rate-limit');


dotenv.config();

const app = express();
app.use(express.json());

// Database connection middleware for serverless
let isConnected = false;
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});


// CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && origin.startsWith('http://localhost:')) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    return res.status(200).json({});
  }
  next();
});

// Rate Limit - More lenient for development
app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  message: 'Too many requests, please try again later.'
}));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => res.send('API is running...'));

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;


// Export the app for Vercel
module.exports = app;

// Start server only if this file is run directly
if (require.main === module) {
  const startServer = async () => {
    try {
      await connectDB();
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  };
  startServer();
}

