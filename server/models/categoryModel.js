const { pool } = require('../config/db');

const createCategory = async (userId, name, color = '#3b82f6') => {
  const query = `
    INSERT INTO categories (user_id, name, color) 
    VALUES ($1, $2, $3) 
    RETURNING *
  `;
  const result = await pool.query(query, [userId, name, color]);
  return result.rows[0];
};

const getCategories = async (userId) => {
  const query = 'SELECT * FROM categories WHERE user_id = $1 ORDER BY name';
  const result = await pool.query(query, [userId]);
  return result.rows;
};

const updateCategory = async (id, userId, name, color) => {
  const query = `
    UPDATE categories 
    SET name = $1, color = $2 
    WHERE id = $3 AND user_id = $4 
    RETURNING *
  `;
  const result = await pool.query(query, [name, color, id, userId]);
  return result.rows[0];
};

const deleteCategory = async (id, userId) => {
  const query = 'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING *';
  const result = await pool.query(query, [id, userId]);
  return result.rows[0];
};

module.exports = { 
  createCategory, 
  getCategories, 
  updateCategory, 
  deleteCategory 
};