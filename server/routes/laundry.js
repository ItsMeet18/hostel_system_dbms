const express = require('express');
const router = express.Router();
const { promisePool } = require('../database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT l.*, r.name AS resident_name
      FROM laundry_services l
      JOIN residents r ON l.resident_id = r.resident_id
      ORDER BY l.service_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/resident/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM laundry_services WHERE resident_id = ? ORDER BY service_date DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { resident_id, service_date, status } = req.body;
    if (!resident_id || !service_date) {
      return res.status(400).json({ error: 'Resident and service date are required' });
    }
    const [result] = await promisePool.query(
      `INSERT INTO laundry_services (resident_id, service_date, status)
       VALUES (?, ?, ?)`,
      [resident_id, service_date, status || 'requested']
    );
    const [laundry] = await promisePool.query('SELECT * FROM laundry_services WHERE laundry_id = ?', [result.insertId]);
    res.status(201).json(laundry[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { service_date, status } = req.body;
    const [result] = await promisePool.query(
      'UPDATE laundry_services SET service_date=?, status=? WHERE laundry_id=?',
      [service_date, status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Laundry record not found' });
    }
    const [laundry] = await promisePool.query('SELECT * FROM laundry_services WHERE laundry_id = ?', [req.params.id]);
    res.json(laundry[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query('DELETE FROM laundry_services WHERE laundry_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Laundry record not found' });
    }
    res.json({ message: 'Laundry request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

