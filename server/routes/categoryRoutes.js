const express = require('express');
const { body } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const validate = require('../middleware/validator');
const { 
  addCategory, 
  getUserCategories, 
  updateUserCategory, 
  deleteUserCategory 
} = require('../controllers/categoryController');

const router = express.Router();

router.post('/', authenticateToken, [
  body('name').trim().notEmpty().withMessage('Category name is required')
], validate, addCategory);

router.get('/', authenticateToken, getUserCategories);

router.put('/:id', authenticateToken, updateUserCategory);
router.delete('/:id', authenticateToken, deleteUserCategory);

module.exports = router;