const express = require('express');
const router = express.Router();
const { promisePool } = require('../database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT p.*, r.name AS resident_name
      FROM roommate_preferences p
      JOIN residents r ON p.resident_id = r.resident_id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/resident/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM roommate_preferences WHERE resident_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { resident_id, preference_type, notes } = req.body;
    if (!resident_id || !preference_type) {
      return res.status(400).json({ error: 'Resident and preference type are required' });
    }
    const [result] = await promisePool.query(
      `INSERT INTO roommate_preferences (resident_id, preference_type, notes)
       VALUES (?, ?, ?)`,
      [resident_id, preference_type, notes || null]
    );
    const [preference] = await promisePool.query('SELECT * FROM roommate_preferences WHERE preference_id = ?', [result.insertId]);
    res.status(201).json(preference[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query('DELETE FROM roommate_preferences WHERE preference_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Preference not found' });
    }
    res.json({ message: 'Preference deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

