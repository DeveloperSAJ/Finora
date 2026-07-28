const express = require('express');
const authenticateToken = require('../middleware/auth');
const { getDailyReport, getMonthlyReport, getDailyTrend } = require('../controllers/reportController');

const router = express.Router();

router.get('/daily', authenticateToken, getDailyReport);
router.get('/monthly', authenticateToken, getMonthlyReport);
router.get('/daily-trend', authenticateToken, getDailyTrend);

module.exports = router;