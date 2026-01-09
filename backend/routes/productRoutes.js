// const express = require("express");
// const router = express.Router();
// const Product = require("../models/Product"); // import model

// // Add product with imageUrl
// router.post("/add", async (req, res) => {
//   try {
//     const { name, price, description, imageUrl } = req.body;

//     if (!name || !price || !imageUrl) {
//       return res.status(400).json({ success: false, message: "Missing fields" });
//     }

//     const product = new Product({ name, price, description, imageUrl });
//     await product.save();

//     res.json({
//       success: true,
//       message: "Product added successfully",
//       data: product
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Error adding product", error: err.message });
//   }
// });

// // Get all products
// router.get("/", async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Error fetching products" });
//   }
// });

// module.exports = router;
const express = require('express');
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  updateProductStock,
  getLowStockProducts,
  getProductStats
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.put('/:id/stock', protect, admin, updateProductStock);
router.get('/admin/low-stock', protect, admin, getLowStockProducts);
router.get('/admin/stats', protect, admin, getProductStats);

module.exports = router;
