const express = require('express');
const { body } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const validate = require('../middleware/validator');

const { 
  addTransaction, 
  getUserTransactions,
  updateUserTransaction,
  deleteUserTransaction,
  deleteTransactionsByDateRange
} = require('../controllers/transactionController');

const router = express.Router();

router.post('/', authenticateToken, [
  body('category_id').isInt().withMessage('Valid category is required'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('transaction_date').isDate().withMessage('Valid date is required')
], validate, addTransaction);

router.get('/', authenticateToken, getUserTransactions);

router.put('/:id', authenticateToken, updateUserTransaction);
router.delete('/:id', authenticateToken, deleteUserTransaction);

// Bulk Delete - This must be AFTER the /:id route
router.delete('/', authenticateToken, deleteTransactionsByDateRange);

module.exports = router;