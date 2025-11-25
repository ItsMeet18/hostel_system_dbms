const express = require('express');
const router = express.Router();
const { promisePool } = require('../database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT v.*, r.name AS resident_name
      FROM visitor_logs v
      JOIN residents r ON v.resident_id = r.resident_id
      ORDER BY v.entry_time DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { resident_id, visitor_name, entry_time, exit_time } = req.body;
    if (!resident_id || !visitor_name || !entry_time) {
      return res.status(400).json({ error: 'Resident, visitor name and entry time are required' });
    }
    const [result] = await promisePool.query(
      `INSERT INTO visitor_logs (resident_id, visitor_name, entry_time, exit_time)
       VALUES (?, ?, ?, ?)`,
      [resident_id, visitor_name, entry_time, exit_time || null]
    );
    const [log] = await promisePool.query('SELECT * FROM visitor_logs WHERE log_id = ?', [result.insertId]);
    res.status(201).json(log[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { exit_time } = req.body;
    const [result] = await promisePool.query(
      'UPDATE visitor_logs SET exit_time=? WHERE log_id=?',
      [exit_time, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Visitor log not found' });
    }
    const [log] = await promisePool.query('SELECT * FROM visitor_logs WHERE log_id = ?', [req.params.id]);
    res.json(log[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query('DELETE FROM visitor_logs WHERE log_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Visitor log not found' });
    }
    res.json({ message: 'Visitor log deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

