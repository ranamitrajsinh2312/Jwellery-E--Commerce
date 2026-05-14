const app = require('../backend/server');
const connectDB = require('../backend/config/db');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error) {
      console.error('Database connection error:', error);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }
  return app(req, res);
};
