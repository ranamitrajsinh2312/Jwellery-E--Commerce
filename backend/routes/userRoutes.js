const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// Admin routes
router.get('/admin/all', protect, admin, getAllUsers);
router.put('/admin/:id', protect, admin, updateUser);
router.delete('/admin/:id', protect, admin, deleteUser);

module.exports = router;
