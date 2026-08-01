const express = require('express');
const authenticateToken = require('../middleware/auth');
const { addSavings, getSavings } = require('../controllers/savingsController');
const { pool } = require('../config/db');

const router = express.Router();

router.post('/', authenticateToken, addSavings);
router.get('/', authenticateToken, getSavings);
// Delete single saving
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM savings WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Saving not found' });
    }

    res.json({ message: 'Saving deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;