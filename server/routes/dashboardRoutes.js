const express = require('express');
const authenticateToken = require('../middleware/auth');
const { pool } = require('../config/db');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Today's summary
    const todayIncome = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM transactions 
       WHERE user_id = $1 AND type = 'income' AND transaction_date = $2`,
      [req.user.id, today]
    );

    const todayExpense = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM transactions 
       WHERE user_id = $1 AND type = 'expense' AND transaction_date = $2`,
      [req.user.id, today]
    );

    // Recent transactions
    const recentTransactions = await pool.query(
      `SELECT t.*, c.name as category_name 
       FROM transactions t 
       LEFT JOIN categories c ON t.category_id = c.id 
       WHERE t.user_id = $1 
       ORDER BY t.transaction_date DESC, t.created_at DESC 
       LIMIT 5`,
      [req.user.id]
    );

    res.json({
      todayIncome: parseFloat(todayIncome.rows[0].total),
      todayExpense: parseFloat(todayExpense.rows[0].total),
      balance: parseFloat(todayIncome.rows[0].total) - parseFloat(todayExpense.rows[0].total),
      recentTransactions: recentTransactions.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;