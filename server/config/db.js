const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const connectDB = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL connected successfully");
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    // Don't use process.exit(1) on Vercel
  }
};

module.exports = { pool, connectDB };