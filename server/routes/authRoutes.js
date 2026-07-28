const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, changePassword, deleteAccount } = require('../controllers/authController.js');
const { getProfile, updateProfile, } = require('../controllers/userController.js');
const authenticateToken = require('../middleware/auth.js');
const validate = require('../middleware/validator.js');

const router = express.Router();

// Auth routes
router.post('/register', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], validate, login);

router.get('/me', authenticateToken, getMe);

// Profile routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);
router.delete('/account', authenticateToken, deleteAccount);

module.exports = router;