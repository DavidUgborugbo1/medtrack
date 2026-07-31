const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get all medications for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const medications = await db.query(
      'SELECT * FROM medications WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(medications.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a medication
router.post('/', auth, async (req, res) => {
  const { name, dosage, frequency, times, current_supply, refill_alert_threshold } = req.body;
  try {
    const newMed = await db.query(
      'INSERT INTO medications (user_id, name, dosage, frequency, times, current_supply, refill_alert_threshold) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.id, name, dosage, frequency, times, current_supply, refill_alert_threshold || 7]
    );
    res.status(201).json(newMed.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a medication
router.put('/:id', auth, async (req, res) => {
  const { name, dosage, frequency, times, current_supply, refill_alert_threshold } = req.body;
  try {
    const updated = await db.query(
      'UPDATE medications SET name=$1, dosage=$2, frequency=$3, times=$4, current_supply=$5, refill_alert_threshold=$6 WHERE id=$7 AND user_id=$8 RETURNING *',
      [name, dosage, frequency, times, current_supply, refill_alert_threshold, req.params.id, req.user.id]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a medication
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM medications WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Medication deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;