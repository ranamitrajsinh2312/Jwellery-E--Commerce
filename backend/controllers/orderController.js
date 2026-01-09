// const Order = require('../models/Order');
// const Cart = require('../models/Cart');
// const Product = require('../models/Product');
// const mongoose = require('mongoose');

// const createOrder = async (req, res) => {
//   const userId = req.user?.id;
//   const { shippingAddress, paymentMethod } = req.body;

//   console.log('Create order request:', { userId, shippingAddress, paymentMethod });

//   try {
//     if (!userId) return res.status(401).json({ message: 'Unauthorized' });
//     if (!shippingAddress || !paymentMethod) {
//       return res.status(400).json({ message: 'Shipping address and payment method required' });
//     }
//     const { addressLine1, city, state, postalCode, country } = shippingAddress;
//     if (!addressLine1 || !city || !state || !postalCode || !country) {
//       return res.status(400).json({ message: 'Complete shipping address required' });
//     }

//     const cart = await Cart.findOne({ user: userId }).populate('items.product');
//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: 'Cart is empty' });
//     }

//     for (const item of cart.items) {
//       if (item.product.stock < item.quantity) {
//         return res.status(400).json({ message: `Insufficient stock for ${item.product.name}` });
//       }
//       item.product.stock -= item.quantity;
//       await item.product.save();
//     }

//     const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
//     const order = new Order({
//       user: userId,
//       items: cart.items.map(item => ({
//         product: item.product._id,
//         quantity: item.quantity,
//         price: item.product.price,
//       })),
//       total,
//       shippingAddress,
//       paymentMethod,
//     });

//     await order.save();
//     await Cart.deleteOne({ user: userId });

//     console.log('Order created:', order._id);
//     res.status(201).json(order);
//   } catch (error) {
//     console.error('Create order error:', error.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const getOrders = async (req, res) => {
//   const userId = req.user?.id;

//   console.log('Get orders request:', { userId });

//   try {
//     if (!userId) return res.status(401).json({ message: 'Unauthorized' });

//     const orders = await Order.find({ user: userId }).populate('items.product');
//     console.log('Orders fetched:', orders.length);
//     res.json(orders);
//   } catch (error) {
//     console.error('Get orders error:', error.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const getAllOrders = async (req, res) => {
//   const userId = req.user?.id;

//   console.log('Get all orders request:', { userId });

//   try {
//     if (!userId) return res.status(401).json({ message: 'Unauthorized' });
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({ message: 'Admin access required' });
//     }

//     const orders = await Order.find().populate('items.product').populate('user', 'email');
//     console.log('All orders fetched:', orders.length);
//     res.json(orders);
//   } catch (error) {
//     console.error('Get all orders error:', error.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const updateOrderStatus = async (req, res) => {
//   const { orderId, status } = req.body;
//   const userId = req.user?.id;

//   console.log('Update order status request:', { userId, orderId, status });

//   try {
//     if (!userId) return res.status(401).json({ message: 'Unauthorized' });
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({ message: 'Admin access required' });
//     }
//     if (!mongoose.Types.ObjectId.isValid(orderId)) {
//       return res.status(400).json({ message: 'Invalid order ID' });
//     }
//     if (!['Pending', 'Shipped', 'Delivered'].includes(status)) {
//       return res.status(400).json({ message: 'Invalid status' });
//     }

//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     order.status = status;
//     await order.save();
//     console.log('Order status updated:', order._id);
//     res.json(order);
//   } catch (error) {
//     console.error('Update order status error:', error.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const cancelOrder = async (req, res) => {
//   const { orderId } = req.body;
//   const userId = req.user?.id;

//   console.log('Cancel order request:', { userId, orderId });

//   try {
//     if (!userId) return res.status(401).json({ message: 'Unauthorized' });
//     if (!mongoose.Types.ObjectId.isValid(orderId)) {
//       return res.status(400).json({ message: 'Invalid order ID' });
//     }

//     const order = await Order.findOne({ _id: orderId, user: userId });
//     if (!order) return res.status(404).json({ message: 'Order not found' });
//     if (order.status !== 'Pending') {
//       return res.status(400).json({ message: 'Cannot cancel - already processed' });
//     }

//     order.status = 'Cancelled';
//     for (const item of order.items) {
//       const product = await Product.findById(item.product);
//       if (product) {
//         product.stock += item.quantity;
//         await product.save();
//       }
//     }

//     await order.save();
//     console.log('Order cancelled:', orderId);
//     res.json(order);
//   } catch (error) {
//     console.error('Cancel order error:', error.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// module.exports = { createOrder, getOrders, getAllOrders, updateOrderStatus, cancelOrder };

const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Create Order with Stock Management
const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Check stock availability and reserve products
    const stockUpdates = [];
    for (const item of orderItems) {
      const product = await Product.findById(item.product).session(session);
      
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }

      // Reserve stock
      product.stock -= item.quantity;
      stockUpdates.push(product);
    }

    // Save all stock updates
    for (const product of stockUpdates) {
      await product.save({ session });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });

    const createdOrder = await order.save({ session });
    await session.commitTransaction();
    
    console.log(`Order created successfully: ${createdOrder._id}, Stock updated for ${stockUpdates.length} products`);
    res.status(201).json(createdOrder);
  } catch (err) {
    await session.abortTransaction();
    console.error('Order creation error:', err);
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

// Get My Orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Order By ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('orderItems.product')
      .populate('user', 'name email');
    
    if (order && (order.user._id.toString() === req.user._id.toString() || req.user.isAdmin)) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Orders (Admin)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'id name email')
      .populate('orderItems.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Order Status with Stock Management
const updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('orderItems.product').session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Order not found' });
    }

    const oldStatus = order.status;
    order.status = status || order.status;

    // Handle stock restoration for cancelled orders
    if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product._id).session(session);
        if (product) {
          product.stock += item.quantity;
          await product.save({ session });
          console.log(`Restored ${item.quantity} units to ${product.name} stock`);
        }
      }
    }

    const updatedOrder = await order.save({ session });
    await session.commitTransaction();
    
    console.log(`Order ${order._id} status updated from ${oldStatus} to ${status}`);
    res.json(updatedOrder);
  } catch (err) {
    await session.abortTransaction();
    console.error('Order status update error:', err);
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

// Cancel Order (User)
const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).populate('orderItems.product').session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Only allow cancellation of pending or processing orders
    if (!['Pending', 'Processing'].includes(order.status)) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cannot cancel order in current status' });
    }

    // Restore stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product._id).session(session);
      if (product) {
        product.stock += item.quantity;
        await product.save({ session });
        console.log(`Restored ${item.quantity} units to ${product.name} stock`);
      }
    }

    order.status = 'Cancelled';
    const cancelledOrder = await order.save({ session });
    await session.commitTransaction();
    
    console.log(`Order ${order._id} cancelled successfully`);
    res.json(cancelledOrder);
  } catch (err) {
    await session.abortTransaction();
    console.error('Order cancellation error:', err);
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

// Get Order Statistics (Admin)
const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const processingOrders = await Order.countDocuments({ status: 'Processing' });
    const shippedOrders = await Order.countDocuments({ status: 'Shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });

    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('orderItems.product', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders
    });
  } catch (err) {
    console.error('Order stats error:', err);
    res.status(500).json({ message: err.message });
  }
};

const placeOrder = createOrder;

module.exports = { 
  placeOrder, 
  getOrders, 
  getOrderById, 
  getMyOrders, 
  updateOrderStatus, 
  cancelOrder,
  getOrderStats 
};
