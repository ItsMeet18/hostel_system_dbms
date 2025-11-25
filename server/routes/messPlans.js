const express = require('express');
const router = express.Router();
const { promisePool } = require('../database');

// Get all plans
router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM mess_plans ORDER BY plan_type');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create plan
router.post('/', async (req, res) => {
  try {
    const { plan_type, cost, description } = req.body;
    if (!plan_type || !cost) {
      return res.status(400).json({ error: 'Plan type and cost are required' });
    }
    const [result] = await promisePool.query(
      'INSERT INTO mess_plans (plan_type, cost, description) VALUES (?, ?, ?)',
      [plan_type, cost, description || null]
    );
    const [plan] = await promisePool.query('SELECT * FROM mess_plans WHERE plan_id = ?', [result.insertId]);
    res.status(201).json(plan[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update plan
router.put('/:id', async (req, res) => {
  try {
    const { plan_type, cost, description } = req.body;
    const [result] = await promisePool.query(
      'UPDATE mess_plans SET plan_type=?, cost=?, description=? WHERE plan_id=?',
      [plan_type, cost, description || null, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    const [plan] = await promisePool.query('SELECT * FROM mess_plans WHERE plan_id = ?', [req.params.id]);
    res.json(plan[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete plan
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query('DELETE FROM mess_plans WHERE plan_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

