const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Log a dose (mark as taken or skipped)
router.post('/', auth, async (req, res) => {
  const { medication_id, status, scheduled_time } = req.body;
  try {
    // Reduce supply by 1 if taken
    if (status === 'taken') {
      await db.query(
        'UPDATE medications SET current_supply = current_supply - 1 WHERE id = $1 AND user_id = $2',
        [medication_id, req.user.id]
      );
    }

    const dose = await db.query(
      'INSERT INTO doses (medication_id, user_id, scheduled_time, taken_at, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [
        medication_id,
        req.user.id,
        scheduled_time || new Date(),
        status === 'taken' ? new Date() : null,
        status,
      ]
    );

    res.status(201).json(dose.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all doses for a user
router.get('/', auth, async (req, res) => {
  try {
    const doses = await db.query(
      `SELECT doses.*, medications.name as medication_name 
       FROM doses 
       JOIN medications ON doses.medication_id = medications.id 
       WHERE doses.user_id = $1 
       ORDER BY doses.created_at DESC`,
      [req.user.id]
    );
    res.json(doses.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;