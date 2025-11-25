const express = require('express');
const router = express.Router();
const { promisePool } = require('../database');

// Get all bills
router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT b.*, r.name AS resident_name
      FROM bills b
      JOIN residents r ON b.resident_id = r.resident_id
      ORDER BY b.due_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bills for resident
router.get('/resident/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM bills WHERE resident_id = ? ORDER BY due_date DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create bill
router.post('/', async (req, res) => {
  try {
    const { resident_id, monthly_rent, additional_charges, due_date, status } = req.body;

    if (!resident_id || !monthly_rent || !due_date) {
      return res.status(400).json({ error: 'Resident, monthly rent and due date are required' });
    }

    const [result] = await promisePool.query(
      `INSERT INTO bills (resident_id, monthly_rent, additional_charges, due_date, status)
       VALUES (?, ?, ?, ?, ?)`,
      [resident_id, monthly_rent, additional_charges || 0, due_date, status || 'pending']
    );

    const [bill] = await promisePool.query('SELECT * FROM bills WHERE bill_id = ?', [result.insertId]);
    res.status(201).json(bill[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update bill
router.put('/:id', async (req, res) => {
  try {
    const { monthly_rent, additional_charges, due_date, status } = req.body;
    const [result] = await promisePool.query(
      `UPDATE bills SET monthly_rent=?, additional_charges=?, due_date=?, status=? WHERE bill_id=?`,
      [monthly_rent, additional_charges || 0, due_date, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const [bill] = await promisePool.query('SELECT * FROM bills WHERE bill_id = ?', [req.params.id]);
    res.json(bill[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete bill
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query('DELETE FROM bills WHERE bill_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

