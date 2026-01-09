// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');

// const register = async (req, res) => {
//   const { email, password } = req.body;

//   console.log('Register request:', { email });

//   try {
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Email and password are required' });
//     }

//     let user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     user = new User({ email, password, role: 'customer' });
//     user.password = await bcrypt.hash(password, 10);
//     await user.save();

//     const payload = { user: { id: user.id, role: user.role } };
//     const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

//     console.log('User registered:', user.email);
//     res.json({ token });
//   } catch (error) {
//     console.error('Register error:', error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// const login = async (req, res) => {
//   const { email, password } = req.body;

//   console.log('Login request:', { email });

//   try {
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Email and password are required' });
//     }

//     const user = await User.findOne({ email });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     const payload = { user: { id: user.id, role: user.role } };
//     const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

//     console.log('User logged in:', user.email);
//     res.json({ token });
//   } catch (error) {
//     console.error('Login error:', error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// const getProfile = async (req, res) => {
//   const userId = req.user?.id;

//   console.log('Get profile request:', { userId });

//   try {
//     if (!userId) return res.status(401).json({ message: 'Unauthorized' });
//     const user = await User.findById(userId).select('-password');
//     if (!user) return res.status(404).json({ message: 'User not found' });
//     res.json(user);
//   } catch (error) {
//     console.error('Get profile error:', error.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const updateProfile = async (req, res) => {
//   const userId = req.user?.id;
//   const { email, password } = req.body;

//   console.log('Update profile request:', { userId, email });

//   try {
//     if (!userId) return res.status(401).json({ message: 'Unauthorized' });
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     if (email) user.email = email;
//     if (password) user.password = await bcrypt.hash(password, 10);

//     await user.save();
//     res.json({ message: 'Profile updated' });
//   } catch (error) {
//     console.error('Update profile error:', error.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   console.log('Forgot password request:', { email });

//   try {
//     if (!email) return res.status(400).json({ message: 'Email required' });

//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
//     const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: { user: 'your-email@gmail.com', pass: 'your-app-password' },
//     });

//     await transporter.sendMail({
//       from: 'your-email@gmail.com',
//       to: email,
//       subject: 'Password Reset',
//       text: `Click here to reset your password: ${resetLink}`,
//     });

//     console.log('Reset email sent to:', email);
//     res.json({ message: 'Reset link sent to email' });
//   } catch (error) {
//     console.error('Forgot password error:', error.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const resetPassword = async (req, res) => {
//   const { token, password } = req.body;

//   console.log('Reset password request:', { token: token.slice(0, 10) + '...' });

//   try {
//     if (!token || !password) return res.status(400).json({ message: 'Token and password required' });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.userId);
//     if (!user) return res.status(404).json({ message: 'Invalid token' });

//     user.password = await bcrypt.hash(password, 10);
//     await user.save();

//     console.log('Password reset for user:', user.email);
//     res.json({ message: 'Password reset successfully' });
//   } catch (error) {
//     console.error('Reset password error:', error.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// module.exports = { register, login, getProfile, updateProfile, forgotPassword, resetPassword };
// controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();
// @desc    Register user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });
      
      console.log(`User registered: ${user.email}`);
      
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });
      
      console.log(`User logged in: ${user.email}`);
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token,
      });
    } else {
      console.log(`Login failed for: ${email}`);
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  res.json({ message: 'User profile', user: req.user });
};

// @desc    Get all users (Admin only)
// @route   GET /api/users/admin/all
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/admin/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { name, email, isAdmin } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.isAdmin = isAdmin !== undefined ? isAdmin : user.isAdmin;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } catch (error) {
    console.error('Update user error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/admin/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  updateUser,
  deleteUser,
};
