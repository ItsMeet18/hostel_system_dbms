const express = require('express');
const router = express.Router();
const { promisePool } = require('../database');

// Get all hostels
router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM hostels ORDER BY hostel_name');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create hostel
router.post('/', async (req, res) => {
  try {
    const { hostel_name, location, hostel_fees, annual_fees, security_deposit, contact_number } = req.body;
    if (!hostel_name || !location) {
      return res.status(400).json({ error: 'Hostel name and location are required' });
    }
    const [result] = await promisePool.query(
      `INSERT INTO hostels (hostel_name, location, hostel_fees, annual_fees, security_deposit, contact_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [hostel_name, location, hostel_fees || null, annual_fees || null, security_deposit || null, contact_number || null]
    );
    const [hostel] = await promisePool.query('SELECT * FROM hostels WHERE hostel_id = ?', [result.insertId]);
    res.status(201).json(hostel[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update hostel
router.put('/:id', async (req, res) => {
  try {
    const { hostel_name, location, hostel_fees, annual_fees, security_deposit, contact_number } = req.body;
    const [result] = await promisePool.query(
      `UPDATE hostels SET hostel_name=?, location=?, hostel_fees=?, annual_fees=?, security_deposit=?, contact_number=?
       WHERE hostel_id=?`,
      [hostel_name, location, hostel_fees || null, annual_fees || null, security_deposit || null, contact_number || null, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    const [hostel] = await promisePool.query('SELECT * FROM hostels WHERE hostel_id = ?', [req.params.id]);
    res.json(hostel[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete hostel
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query('DELETE FROM hostels WHERE hostel_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    res.json({ message: 'Hostel deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

