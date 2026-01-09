const Category = require('../models/Category');

const addCategory = async (req, res) => {
  const { name } = req.body;

  console.log('🔥 NEW Add category request:', { name, user: req.user?.email });

  try {
    const trimmed = (name || '').trim();
    if (!trimmed) return res.status(400).json({ message: 'Name required' });

    // Prevent duplicates case-insensitively
    const existing = await Category.findOne({ name: { $regex: `^${trimmed}$`, $options: 'i' } });
    if (existing) {
      return res.status(409).json({ message: 'Category name already exists' });
    }

    const category = new Category({ name: trimmed });
    await category.save();
    console.log('Category added:', category);
    res.status(201).json(category);
  } catch (error) {
    console.error('Add category error:', error.message);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Category name already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    console.log('Categories fetched:', categories.length);
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const trimmed = (name || '').trim();
    if (!trimmed) return res.status(400).json({ message: 'Name required' });
    
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // If name changes, check duplicates (case-insensitive)
    if (category.name.toLowerCase() !== trimmed.toLowerCase()) {
      const conflict = await Category.findOne({ name: { $regex: `^${trimmed}$`, $options: 'i' } });
      if (conflict) {
        return res.status(409).json({ message: 'Category name already exists' });
      }
    }
    
    category.name = trimmed;
    await category.save();
    console.log('Category updated:', category);
    res.json(category);
  } catch (error) {
    console.error('Update category error:', error.message);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Category name already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    console.log('Category deleted:', category);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addCategory, getCategories, updateCategory, deleteCategory };