const { findUserById, updateUser } = require('../models/userModel');

const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error in getProfile', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await updateUser(req.user.id, username, email);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error in updateProfile', error: error.message });
  }
};

module.exports = { getProfile, updateProfile };