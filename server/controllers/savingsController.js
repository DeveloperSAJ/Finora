const { addSavings, getSavings } = require("../models/savingsModel");

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

const getUserSavings = async (req, res) => {
  try {
    const savings = await getSavings(req.user.id);
    res.json(savings);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server Error in getUserSavings",
        error: error.message,
      });
  }
};

module.exports = { addSaving, getUserSavings };
