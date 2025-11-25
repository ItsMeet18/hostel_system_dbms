const express = require('express');
const router = express.Router();
const { promisePool } = require('../database');

// Get all residents with hostel and mess info
router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT r.*, h.hostel_name, h.location, mp.plan_type, mp.cost
       FROM residents r
       LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
       LEFT JOIN mess_plans mp ON r.mess_plan_id = mp.plan_id
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single resident
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT r.*, h.hostel_name, h.location, mp.plan_type, mp.cost
       FROM residents r
       LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
       LEFT JOIN mess_plans mp ON r.mess_plan_id = mp.plan_id
       WHERE r.resident_id = ?`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Resident not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create resident
router.post('/', async (req, res) => {
  try {
    const { name, gender, contact_number, emergency_contact, email, password, hostel_id, mess_plan_id } = req.body;

    if (!name || !gender || !contact_number) {
      return res.status(400).json({ error: 'Name, gender and contact number are required' });
    }

    const [result] = await promisePool.query(
      `INSERT INTO residents (name, gender, contact_number, emergency_contact, email, password, hostel_id, mess_plan_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, gender, contact_number, emergency_contact || null, email || null, password || null, hostel_id || null, mess_plan_id || null]
    );

    const [resident] = await promisePool.query('SELECT * FROM residents WHERE resident_id = ?', [result.insertId]);
    res.status(201).json(resident[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update resident
router.put('/:id', async (req, res) => {
  try {
    const { name, gender, contact_number, emergency_contact, email, password, hostel_id, mess_plan_id } = req.body;

    const [result] = await promisePool.query(
      `UPDATE residents SET name=?, gender=?, contact_number=?, emergency_contact=?, email=?, password=?, hostel_id=?, mess_plan_id=?
       WHERE resident_id=?`,
      [name, gender, contact_number, emergency_contact || null, email || null, password || null, hostel_id || null, mess_plan_id || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Resident not found' });
    }

    const [resident] = await promisePool.query('SELECT * FROM residents WHERE resident_id = ?', [req.params.id]);
    res.json(resident[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete resident
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query('DELETE FROM residents WHERE resident_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Resident not found' });
    }
    res.json({ message: 'Resident deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

