const { pool } = require('../config/db');

const createTransaction = async (userId, categoryId, type, amount, description, transactionDate) => {
  const query = `
    INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date)
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING *
  `;
  const result = await pool.query(query, [userId, categoryId, type, amount, description, transactionDate]);
  return result.rows[0];
};

const getTransactions = async (userId, { limit = 50, offset = 0, type, startDate, endDate } = {}) => {
  let query = `
    SELECT t.*, c.name as category_name, c.color 
    FROM transactions t 
    LEFT JOIN categories c ON t.category_id = c.id 
    WHERE t.user_id = $1
  `;
  let values = [userId];
  let paramCount = 2;

  if (type) {
    query += ` AND t.type = $${paramCount}`;
    values.push(type);
    paramCount++;
  }
  if (startDate) {
    query += ` AND t.transaction_date >= $${paramCount}`;
    values.push(startDate);
    paramCount++;
  }
  if (endDate) {
    query += ` AND t.transaction_date <= $${paramCount}`;
    values.push(endDate);
    paramCount++;
  }

  query += ` ORDER BY t.transaction_date DESC, t.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  values.push(limit, offset);

  const result = await pool.query(query, values);
  return result.rows;
};

const getTransactionById = async (id, userId) => {
  const query = `
    SELECT t.*, c.name as category_name 
    FROM transactions t 
    LEFT JOIN categories c ON t.category_id = c.id 
    WHERE t.id = $1 AND t.user_id = $2
  `;
  const result = await pool.query(query, [id, userId]);
  return result.rows[0];
};

const updateTransaction = async (id, userId, data) => {
  const { category_id, type, amount, description, transaction_date } = data;
  const query = `
    UPDATE transactions 
    SET category_id = $1, type = $2, amount = $3, description = $4, transaction_date = $5
    WHERE id = $6 AND user_id = $7 
    RETURNING *
  `;
  const result = await pool.query(query, [category_id, type, amount, description, transaction_date, id, userId]);
  return result.rows[0];
};

const deleteTransaction = async (id, userId) => {
  const query = 'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *';
  const result = await pool.query(query, [id, userId]);
  return result.rows[0];
};

const deleteTransactionsByDateRangeModel = async (userId, startDate, endDate) => {
  const query = `
    DELETE FROM transactions 
    WHERE user_id = $1 
      AND transaction_date BETWEEN $2 AND $3 
    RETURNING id
  `;
  const result = await pool.query(query, [userId, startDate, endDate]);
  return result.rowCount;
};

module.exports = { 
  createTransaction, 
  getTransactions, 
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  deleteTransactionsByDateRangeModel
};