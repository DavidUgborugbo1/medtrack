const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");

// Log a dose (mark as taken or skipped)
// Log a dose (mark as taken or skipped)
router.post("/", auth, async (req, res) => {
  const { medication_id, status, scheduled_time } = req.body;
  try {
    if (status === "taken") {
      // Check current supply first
      const med = await db.query(
        "SELECT current_supply FROM medications WHERE id = $1 AND user_id = $2",
        [medication_id, req.user.id],
      );

      if (med.rows.length === 0) {
        return res.status(404).json({ message: "Medication not found" });
      }

      if (med.rows[0].current_supply <= 0) {
        return res
          .status(400)
          .json({ message: "No supply left, please refill" });
      }

      // Only reduce if supply is above 0
      await db.query(
        "UPDATE medications SET current_supply = current_supply - 1 WHERE id = $1 AND user_id = $2",
        [medication_id, req.user.id],
      );
    }

    const dose = await db.query(
      "INSERT INTO doses (medication_id, user_id, scheduled_time, taken_at, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        medication_id,
        req.user.id,
        scheduled_time || new Date(),
        status === "taken" ? new Date() : null,
        status,
      ],
    );

    res.status(201).json(dose.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
