// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const {
  addProduct,
  deleteProduct,
  getAllProducts
} = require("../controllers/adminController");

// Routes
router.post("/add", addProduct);
router.delete("/:id", deleteProduct);
router.get("/", getAllProducts);

module.exports = router;
