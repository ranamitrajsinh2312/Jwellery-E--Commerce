const Product = require('../models/Product');
const mongoose = require('mongoose');

// Create Product (Admin only)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, images, category, stock, material, weight, purity, brand, tags, isFeatured, discountPrice } = req.body;

    // Validation
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'Name, description, price, and category are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    // Handle file uploads if using multer
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    } else if (req.file) {
      imageUrls = [`/uploads/${req.file.filename}`];
    } else if (images) {
      imageUrls = Array.isArray(images) ? images.filter(Boolean) : [images].filter(Boolean);
    }

    const product = new Product({
      name,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      images: imageUrls,
      category,
      stock: stock ? Number(stock) : 0,
      material: material || 'Generic',
      weight: weight ? Number(weight) : null,
      purity: purity || null,
      brand: brand || 'Generic',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []),
      isFeatured: Boolean(isFeatured),
    });

    const createdProduct = await product.save();
    console.log('Product created successfully:', createdProduct.name);
    res.status(201).json(createdProduct);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get All Products
const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = { isActive: true }; // Only show active products
    
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
        { brand: searchRegex },
        { material: searchRegex }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    console.log('Search query:', { search, category, mongoQuery: JSON.stringify(query) });
    
    const products = await Product.find(query).populate('category').sort({ createdAt: -1 });
    console.log(`Found ${products.length} products`);
    
    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get Single Product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (product) res.json(product);
    else res.status(404).json({ message: 'Product not found' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Product (Admin)
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, images, category, stock, material, weight, purity, brand, tags, isFeatured, discountPrice } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle file uploads if using multer
    let imageUrls = product.images; // Keep existing images by default
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    } else if (req.file) {
      imageUrls = [`/uploads/${req.file.filename}`];
    } else if (images !== undefined) {
      imageUrls = Array.isArray(images) ? images.filter(Boolean) : [images].filter(Boolean);
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price ? Number(price) : product.price;
    product.discountPrice = discountPrice !== undefined ? (discountPrice ? Number(discountPrice) : null) : product.discountPrice;
    product.images = imageUrls;
    product.category = category || product.category;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    product.material = material || product.material;
    product.weight = weight !== undefined ? (weight ? Number(weight) : null) : product.weight;
    product.purity = purity || product.purity;
    product.brand = brand || product.brand;
    if (tags !== undefined) {
      product.tags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []);
    }
    product.isFeatured = isFeatured !== undefined ? Boolean(isFeatured) : product.isFeatured;

    const updatedProduct = await product.save();
    console.log('Product updated successfully:', updatedProduct.name);
    res.json(updatedProduct);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Delete Product (Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else res.status(404).json({ message: 'Product not found' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Product Stock (Admin)
const updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (stock < 0) {
      return res.status(400).json({ message: 'Stock cannot be negative' });
    }

    const oldStock = product.stock;
    product.stock = Number(stock);
    const updatedProduct = await product.save();
    
    console.log(`Stock updated for ${product.name}: ${oldStock} → ${stock}`);
    res.json(updatedProduct);
  } catch (err) {
    console.error('Update stock error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get Low Stock Products (Admin)
const getLowStockProducts = async (req, res) => {
  try {
    const threshold = req.query.threshold || 10;
    const lowStockProducts = await Product.find({ 
      stock: { $lte: Number(threshold) },
      isActive: true 
    }).populate('category');
    
    res.json(lowStockProducts);
  } catch (err) {
    console.error('Get low stock products error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get Product Statistics (Admin)
const getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 10, $gt: 0 } });
    
    const categoryStats = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$stock' } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { categoryName: '$category.name', count: 1, totalStock: 1 } }
    ]);

    res.json({
      totalProducts,
      activeProducts,
      outOfStockProducts,
      lowStockProducts,
      categoryStats
    });
  } catch (err) {
    console.error('Product stats error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { 
  createProduct, 
  getProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct,
  updateProductStock,
  getLowStockProducts,
  getProductStats
};
