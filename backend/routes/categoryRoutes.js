// const express = require('express');
// const router = express.Router();
// const { addCategory, getCategories } = require('../controllers/categoryController');
// const auth = require('../middleware/auth');

// router.post('/', auth, addCategory);
// router.get('/', getCategories);

// module.exports = router;

const express = require('express');
const { addCategory, getCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, admin, addCategory);
router.get('/', getCategories);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
