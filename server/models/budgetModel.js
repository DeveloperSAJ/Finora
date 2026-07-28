const { pool } = require('../config/db');

const createOrUpdateBudget = async (userId, categoryId, limitAmount, month) => {
  const query = `
    INSERT INTO budgets (user_id, category_id, limit_amount, month)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, category_id, month) 
    DO UPDATE SET limit_amount = $3
    RETURNING *
  `;
  const result = await pool.query(query, [userId, categoryId, limitAmount, month]);
  return result.rows[0];
};

const getBudgets = async (userId, month) => {
  const query = `
    SELECT b.*, c.name as category_name 
    FROM budgets b 
    JOIN categories c ON b.category_id = c.id 
    WHERE b.user_id = $1 AND b.month = $2
  `;
  const result = await pool.query(query, [userId, month]);
  return result.rows;
};

module.exports = { 
  createOrUpdateBudget, 
  getBudgets 
};