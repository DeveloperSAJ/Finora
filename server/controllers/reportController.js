const { pool } = require('../config/db');

const getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const query = `
      SELECT 
        type,
        COALESCE(SUM(amount), 0) as total,
        COUNT(*) as count
      FROM transactions 
      WHERE user_id = $1 AND transaction_date = $2 
      GROUP BY type
    `;
    const result = await pool.query(query, [req.user.id, targetDate]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server Error in getDailyReport', error: error.message });
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    const { month } = req.query;
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    const query = `
      SELECT 
        type,
        COALESCE(SUM(amount), 0) as total
      FROM transactions 
      WHERE user_id = $1 
        AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', $2::date)
      GROUP BY type
    `;
    const result = await pool.query(query, [req.user.id, targetMonth + '-01']);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server Error in getMonthlyReport', error: error.message });
  }
};

// NEW: Real daily trend for the chart
const getDailyTrend = async (req, res) => {
  try {
    const { month } = req.query;
    let year, mon;

    if (month) {
      [year, mon] = month.split('-').map(Number);
    } else {
      const now = new Date();
      year = now.getFullYear();
      mon = now.getMonth() + 1;
    }

    const startDate = `${year}-${String(mon).padStart(2, '0')}-01`;
    const endDate = new Date(year, mon, 0).toISOString().split('T')[0];
    const daysInMonth = new Date(year, mon, 0).getDate();

    // Transactions (income + expense)
    const txResult = await pool.query(
      `
      SELECT 
        EXTRACT(DAY FROM transaction_date)::int AS day,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
      FROM transactions
      WHERE user_id = $1
        AND transaction_date >= $2
        AND transaction_date <= $3
      GROUP BY EXTRACT(DAY FROM transaction_date)
      ORDER BY day
      `,
      [req.user.id, startDate, endDate]
    );

    // Savings (add / use)
    const savingsResult = await pool.query(
      `
      SELECT 
        EXTRACT(DAY FROM transaction_date)::int AS day,
        COALESCE(SUM(CASE WHEN type = 'add' THEN amount ELSE 0 END), 0) AS savings_add,
        COALESCE(SUM(CASE WHEN type = 'use' THEN amount ELSE 0 END), 0) AS savings_use
      FROM savings
      WHERE user_id = $1
        AND transaction_date >= $2
        AND transaction_date <= $3
      GROUP BY EXTRACT(DAY FROM transaction_date)
      ORDER BY day
      `,
      [req.user.id, startDate, endDate]
    );

    // Build map
    const map = {};
    for (let d = 1; d <= daysInMonth; d++) {
      map[d] = { day: d, income: 0, expense: 0, savings: 0 };
    }

    txResult.rows.forEach((r) => {
      map[r.day].income = parseFloat(r.income);
      map[r.day].expense = parseFloat(r.expense);
    });

    savingsResult.rows.forEach((r) => {
      // Net savings for the day (add - use)
      map[r.day].savings = parseFloat(r.savings_add) - parseFloat(r.savings_use);
    });

    const trend = Object.values(map).sort((a, b) => a.day - b.day);
    res.json(trend);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDailyReport, getMonthlyReport, getDailyTrend };