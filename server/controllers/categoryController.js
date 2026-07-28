const { createCategory, getCategories, updateCategory, deleteCategory } = require('../models/categoryModel');

const addCategory = async (req, res) => {
  try {
    const { name, color } = req.body;
    const category = await createCategory(req.user.id, name, color);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserCategories = async (req, res) => {
  try {
    const categories = await getCategories(req.user.id);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUserCategory = async (req, res) => {
  try {
    const { name, color } = req.body;
    const category = await updateCategory(req.params.id, req.user.id, name, color);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUserCategory = async (req, res) => {
  try {
    const category = await deleteCategory(req.params.id, req.user.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  addCategory, 
  getUserCategories, 
  updateUserCategory, 
  deleteUserCategory 
};