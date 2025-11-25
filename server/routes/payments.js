const express = require('express');
const router = express.Router();
const { promisePool } = require('../database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT p.*, r.name AS resident_name
      FROM payments p
      JOIN residents r ON p.resident_id = r.resident_id
      ORDER BY p.payment_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { resident_id, amount, payment_date, payment_status } = req.body;
    if (!resident_id || !amount || !payment_date) {
      return res.status(400).json({ error: 'Resident, amount and date are required' });
    }
    const [result] = await promisePool.query(
      `INSERT INTO payments (resident_id, amount, payment_date, payment_status)
       VALUES (?, ?, ?, ?)`,
      [resident_id, amount, payment_date, payment_status || 'pending']
    );
    const [payment] = await promisePool.query('SELECT * FROM payments WHERE payment_id = ?', [result.insertId]);
    res.status(201).json(payment[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { amount, payment_date, payment_status } = req.body;
    const [result] = await promisePool.query(
      'UPDATE payments SET amount=?, payment_date=?, payment_status=? WHERE payment_id=?',
      [amount, payment_date, payment_status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    const [payment] = await promisePool.query('SELECT * FROM payments WHERE payment_id = ?', [req.params.id]);
    res.json(payment[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query('DELETE FROM payments WHERE payment_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

