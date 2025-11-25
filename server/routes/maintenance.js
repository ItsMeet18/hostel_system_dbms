const express = require('express');
const router = express.Router();
const { promisePool } = require('../database');

// Get all maintenance requests
router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT m.*, r.name AS resident_name
      FROM maintenance_requests m
      JOIN residents r ON m.resident_id = r.resident_id
      ORDER BY m.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get requests for resident
router.get('/resident/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM maintenance_requests WHERE resident_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create request
router.post('/', async (req, res) => {
  try {
    const { resident_id, issue_description } = req.body;
    if (!resident_id || !issue_description) {
      return res.status(400).json({ error: 'Resident and issue description are required' });
    }
    const [result] = await promisePool.query(
      'INSERT INTO maintenance_requests (resident_id, issue_description) VALUES (?, ?)',
      [resident_id, issue_description]
    );
    const [request] = await promisePool.query('SELECT * FROM maintenance_requests WHERE request_id = ?', [result.insertId]);
    res.status(201).json(request[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update request
router.put('/:id', async (req, res) => {
  try {
    const { complaint_status } = req.body;
    const [result] = await promisePool.query(
      'UPDATE maintenance_requests SET complaint_status=? WHERE request_id=?',
      [complaint_status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    const [request] = await promisePool.query('SELECT * FROM maintenance_requests WHERE request_id = ?', [req.params.id]);
    res.json(request[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete request
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query('DELETE FROM maintenance_requests WHERE request_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

