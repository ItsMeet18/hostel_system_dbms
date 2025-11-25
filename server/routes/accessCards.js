const express = require('express');
const router = express.Router();
const { promisePool } = require('../database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT a.*, r.name AS resident_name
      FROM access_cards a
      JOIN residents r ON a.resident_id = r.resident_id
      ORDER BY a.issue_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { resident_id, issue_date, status } = req.body;
    if (!resident_id || !issue_date) {
      return res.status(400).json({ error: 'Resident and issue date are required' });
    }
    const [result] = await promisePool.query(
      `INSERT INTO access_cards (resident_id, issue_date, status)
       VALUES (?, ?, ?)`,
      [resident_id, issue_date, status || 'active']
    );
    const [card] = await promisePool.query('SELECT * FROM access_cards WHERE card_id = ?', [result.insertId]);
    res.status(201).json(card[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const [result] = await promisePool.query(
      'UPDATE access_cards SET status=? WHERE card_id=?',
      [status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    const [card] = await promisePool.query('SELECT * FROM access_cards WHERE card_id = ?', [req.params.id]);
    res.json(card[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query('DELETE FROM access_cards WHERE card_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

