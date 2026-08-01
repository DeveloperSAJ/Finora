const { pool } = require('../config/db');

const addSavings = async (userId, amount, description, type, transactionDate) => {
  const query = `
    INSERT INTO savings (user_id, amount, description, type, transaction_date)
    VALUES ($1, $2, $3, $4, $5) RETURNING *
  `;
  const result = await pool.query(query, [userId, amount, description, type, transactionDate]);
  return result.rows[0];
};

const getSavings = async (userId) => {
  const query = 'SELECT * FROM savings WHERE user_id = $1 ORDER BY transaction_date DESC';
  const result = await pool.query(query, [userId]);
  return result.rows;
};

module.exports = { addSavings, getSavings };