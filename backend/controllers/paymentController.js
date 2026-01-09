const Payment = require('../models/Payment');
const Order = require('../models/Order');

// Record Payment
const addPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, transactionId, status } = req.body;

    const payment = new Payment({
      order: orderId,
      method: paymentMethod,
      status: status === 'Paid' ? 'success' : 'pending',
      transactionId,
      paidAt: status === 'Paid' ? new Date() : null
    });
    const createdPayment = await payment.save();

    // Update order payment status
    const order = await Order.findById(orderId);
    if (order) {
      order.paymentStatus = status === 'Paid' ? 'paid' : 'pending';
      await order.save();
    }

    res.status(201).json(createdPayment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const processPayment = addPayment;

module.exports = { processPayment };




// const Order = require('../models/Order');
// const mongoose = require('mongoose');

// const processPayment = async (req, res) => {
//   const { orderId, amount } = req.body;
//   const userId = req.user?.id;

//   console.log('Process payment request:', { userId, orderId, amount });

//   try {
//     if (!userId) return res.status(401).json({ message: 'Unauthorized' });
//     if (!orderId || !amount) {
//       return res.status(400).json({ message: 'Order ID and amount required' });
//     }
//     if (!mongoose.Types.ObjectId.isValid(orderId)) {
//       return res.status(400).json({ message: 'Invalid order ID' });
//     }

//     const order = await Order.findById(orderId);
//     if (!order || order.user.toString() !== userId) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     const paymentResult = {
//       status: 'success',
//       transactionId: `txn_${Date.now()}`,
//       amount: amount,
//       orderId: orderId,
//     };

//     order.paymentStatus = 'Paid';
//     await order.save();

//     console.log('Dummy payment processed:', paymentResult);
//     res.json(paymentResult);
//   } catch (error) {
//     console.error('Payment error:', error.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// module.exports = { processPayment };