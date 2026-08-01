const { pool } = require("../config/db");

const addSaving = async (req, res) => {
  try {
    const { amount, description, type, transaction_date } = req.body;

    // ===== DEBUGGING =====
    console.log("========== SAVINGS DEBUG ==========");
    console.log("Full body:", req.body);
    console.log("type value:", type);
    console.log("type type:", typeof type);
    console.log("===================================");

    // Temporary: Accept only correct values
    if (type !== "deposit" && type !== "withdrawal") {
      return res.status(400).json({
        message: "Invalid type. Must be 'deposit' or 'withdrawal'",
        receivedType: type,
        receivedBody: req.body,
      });
    }

    const saving = await addSavings(
      req.user.id,
      amount,
      description,
      type,
      transaction_date,
    );

    res.status(201).json(saving);
  } catch (error) {
    console.error("addSaving Error:", error.message);
    res.status(500).json({
      message: "Server Error in addSaving",
      error: error.message,
      receivedType: req.body?.type,
      receivedBody: req.body,
    });
  }
};

const getSavings = async (userId) => {
  const query =
    "SELECT * FROM savings WHERE user_id = $1 ORDER BY transaction_date DESC";
  const result = await pool.query(query, [userId]);
  return result.rows;
};

module.exports = { addSavings, getSavings };
