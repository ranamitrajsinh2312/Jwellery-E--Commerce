// const express = require('express');
// const router = express.Router();
// const { createOrder, getOrders, getAllOrders, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
// const auth = require('../middleware/auth');

// router.post('/', auth, createOrder);
// router.get('/', auth, getOrders);
// router.get('/all', auth, getAllOrders);
// router.put('/status', auth, updateOrderStatus); // Admin only
// router.put('/cancel', auth, cancelOrder); // Line 10 - Error here

// module.exports = router;

const express = require('express');
const { 
  placeOrder, 
  getOrders, 
  getOrderById, 
  getMyOrders, 
  updateOrderStatus, 
  cancelOrder,
  getOrderStats 
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// User routes
router.post('/', protect, placeOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);

// Admin routes
router.get('/', protect, admin, getOrders);
router.get('/admin/stats', protect, admin, getOrderStats);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
