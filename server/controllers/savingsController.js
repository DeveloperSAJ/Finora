const { addSavings, getSavings } = require('../models/savingsModel');

const addSaving = async (req, res) => {
  try {
    const { amount, description, type, transaction_date } = req.body;
    const saving = await addSavings(req.user.id, amount, description, type, transaction_date);
    res.status(201).json(saving);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserSavings = async (req, res) => {
  try {
    const savings = await getSavings(req.user.id);
    res.json(savings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addSaving, getUserSavings };