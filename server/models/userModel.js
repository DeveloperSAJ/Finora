const { pool } = require('../config/db');

const createUser = async (username, email, hashedPassword) => {
  const query = `
    INSERT INTO users (username, email, password) 
    VALUES ($1, $2, $3) 
    RETURNING id, username, email, created_at
  `;
  const values = [username, email, hashedPassword];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const findUserById = async (id) => {
  const query = 'SELECT id, username, email, password, created_at FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const updateUser = async (id, username, email) => {
  const query = `
    UPDATE users 
    SET username = $1, email = $2, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $3 
    RETURNING id, username, email
  `;
  const result = await pool.query(query, [username, email, id]);
  return result.rows[0];
};

const updatePassword = async (id, hashedPassword) => {
  const query = `
    UPDATE users 
    SET password = $1, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $2 
    RETURNING id
  `;
  const result = await pool.query(query, [hashedPassword, id]);
  return result.rows[0];
};

module.exports = { 
  createUser, 
  findUserByEmail, 
  findUserById,
  updateUser,
  updatePassword
};