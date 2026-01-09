// const express = require('express');
// const router = express.Router();
// const { addToCart, getCart, removeFromCart, updateCartItem } = require('../controllers/cartController'); // Add updateCartItem
// const auth = require('../middleware/auth');

// router.post('/', auth, addToCart);
// router.get('/', auth, getCart);
// router.delete('/:productId', auth, removeFromCart);
// router.put('/', auth, updateCartItem); // This line is fine now

// module.exports = router;

const express = require('express');
const { addToCart, getCart, removeFromCart, updateCartItem } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, addToCart);
router.get('/', protect, getCart);
router.put('/', protect, updateCartItem);
router.delete('/:productId', protect, removeFromCart);

module.exports = router;
