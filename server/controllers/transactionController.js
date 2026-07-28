const { pool } = require('../config/db');
const { 
  createTransaction, 
  getTransactions, 
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  deleteTransactionsByDateRangeModel
} = require('../models/transactionModel');

const addTransaction = async (req, res) => {
  try {
    const { category_id, type, amount, description, transaction_date } = req.body;

    console.log("Received data:", req.body); // Debugging

    if (!category_id) {
      return res.status(400).json({ message: 'Category is required' });
    }
    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Valid type is required' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const transaction = await createTransaction(
      req.user.id, 
      category_id, 
      type, 
      amount, 
      description || '', 
      transaction_date || new Date().toISOString().split('T')[0]
    );

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Add Transaction Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserTransactions = async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    const transactions = await getTransactions(req.user.id, filters);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUserTransaction = async (req, res) => {
  try {
    const transaction = await updateTransaction(req.params.id, req.user.id, req.body);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUserTransaction = async (req, res) => {
  try {
    const transaction = await deleteTransaction(req.params.id, req.user.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteTransactionsByDateRange = async (req, res) => {
  try {
    console.log("Bulk delete called - Query:", req.query);   // Debug

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    // Call the MODEL function, not itself!
    const deletedCount = await deleteTransactionsByDateRangeModel(
      req.user.id, 
      startDate, 
      endDate
    );

    res.json({ 
      message: `Deleted ${deletedCount} transactions successfully`,
      deletedCount 
    });
  } catch (error) {
    console.error("Bulk Delete Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  addTransaction, 
  getUserTransactions,
  updateUserTransaction,
  deleteUserTransaction,
  deleteTransactionsByDateRange
};