const express = require('express');
const router = express.Router();
const { promisePool } = require('../database');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@hostel.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Resident login
router.post('/resident', async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ error: 'Identifier (email/contact/resident ID) is required' });
    }

    const [rows] = await promisePool.query(
      `SELECT resident_id, name, gender, contact_number, emergency_contact, email, hostel_id, mess_plan_id
       FROM residents
       WHERE email = ? OR contact_number = ? OR resident_id = ?`,
      [identifier, identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Resident not found' });
    }

    const resident = rows[0];
    res.json({ type: 'resident', resident });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin login
router.post('/admin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return res.json({
        type: 'admin',
        admin: {
          email: ADMIN_EMAIL,
          name: 'Hostel Administrator'
        }
      });
    }

    return res.status(401).json({ error: 'Invalid admin credentials' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

