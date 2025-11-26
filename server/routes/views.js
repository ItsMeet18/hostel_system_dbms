const express = require('express');
const router = express.Router();
const { promisePool } = require('../database');

// Get resident room details view
router.get('/resident-room-details', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM resident_room_details');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get maintenance dashboard view
router.get('/maintenance-dashboard', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM maintenance_dashboard');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get room occupancy view
router.get('/room-occupancy', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM room_occupancy_view');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get financial summary view
router.get('/financial-summary', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM financial_summary');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
