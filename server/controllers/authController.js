const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  createUser,
  findUserByEmail,
  findUserById,
  updatePassword,
} = require("../models/userModel");

const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter.");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter.");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number.");
  }

  if (!/[@$!%*?&]/.test(password)) {
    errors.push(
      "Password must contain at least one special character (@$!%*?&)."
    );
  }

  return errors;
};

const register = async (req, res) => {
  let { username, email, password } = req.body;

  username = username?.trim();
  email = email?.trim().toLowerCase();

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "All fields are required.",
    });
  }

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      message:
        "Username must be 3-20 characters and contain only letters, numbers, and underscores.",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      message: "Invalid email address.",
    });
  }

  const errors = validatePassword(password);

  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        message: "Unable to create account.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await createUser(username, email, hashedPassword);

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
        issuer: "your-api",
      }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

const login = async (req, res) => {
  let { email, password } = req.body;

  email = email?.trim().toLowerCase();

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required.",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      message: "Invalid email address.",
    });
  }

  try {
    const user = await findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current and new password are required.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message:
          "New password must be different from the current password.",
      });
    }

    const passwordErrors = validatePassword(newPassword);

    if (passwordErrors.length) {
      return res.status(400).json({
        errors: passwordErrors,
      });
    }

    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await updatePassword(req.user.id, hashedPassword);

    res.json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pool } = require("../config/db");

    await pool.query("DELETE FROM transactions WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM savings WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM categories WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    res.json({
      message: "Account deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  deleteAccount,
};