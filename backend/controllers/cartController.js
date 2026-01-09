const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user?.id;

  try {
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Product ID and valid quantity required' });
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    const newQuantity = itemIndex > -1 ? cart.items[itemIndex].quantity + quantity : quantity;
    if (product.stock < newQuantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity: quantity });
    }

    await cart.save();
    const updatedCart = await Cart.findOne({ user: userId }).populate('items.product');
    res.json(updatedCart);
  } catch (error) {
    console.error('Add to cart error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCart = async (req, res) => {
  const userId = req.user?.id;

  console.log('Get cart request:', { userId });

  try {
    if (!userId) return res.status(401).json({ message: 'Unauthorized - No user ID' });

    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    res.json(cart || { items: [] });
  } catch (error) {
    console.error('Get cart error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user?.id;

  console.log('Remove from cart request:', { userId, productId });

  try {
    if (!userId) return res.status(401).json({ message: 'Unauthorized - No user ID' });
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.product._id.toString() !== productId);
    await cart.save();
    const updatedCart = await Cart.findOne({ user: userId }).populate('items.product');
    console.log('Cart after removal:', updatedCart);
    res.json(updatedCart);
  } catch (error) {
    console.error('Remove from cart error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user?.id;

  console.log('Update cart request:', { userId, productId, quantity });

  try {
    if (!userId) return res.status(401).json({ message: 'Unauthorized - No user ID' });
    if (!productId || quantity === undefined || quantity < 0) {
      return res.status(400).json({ message: 'Product ID and valid quantity are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(item => item.product._id.toString() === productId);
    if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in cart' });

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    const updatedCart = await Cart.findOne({ user: userId }).populate('items.product');
    console.log('Cart updated:', updatedCart);
    res.json(updatedCart);
  } catch (error) {
    console.error('Update cart error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { addToCart, getCart, removeFromCart, updateCartItem };