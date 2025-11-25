const express = require('express');
const router = express.Router();
const { promisePool } = require('../database');

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM rooms ORDER BY floor, room_number');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get room by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM rooms WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new room
router.post('/', async (req, res) => {
  try {
    const { room_number, floor, capacity, status } = req.body;
    
    if (!room_number || !floor || !capacity) {
      return res.status(400).json({ error: 'Room number, floor, and capacity are required' });
    }

    const [result] = await promisePool.query(
      'INSERT INTO rooms (room_number, floor, capacity, status) VALUES (?, ?, ?, ?)',
      [room_number, floor, capacity, status || 'available']
    );

    const [newRoom] = await promisePool.query('SELECT * FROM rooms WHERE id = ?', [result.insertId]);
    res.status(201).json(newRoom[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Room number already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update room
router.put('/:id', async (req, res) => {
  try {
    const { room_number, floor, capacity, status } = req.body;
    
    const [result] = await promisePool.query(
      'UPDATE rooms SET room_number = ?, floor = ?, capacity = ?, status = ? WHERE id = ?',
      [room_number, floor, capacity, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const [updatedRoom] = await promisePool.query('SELECT * FROM rooms WHERE id = ?', [req.params.id]);
    res.json(updatedRoom[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Room number already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete room
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query('DELETE FROM rooms WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

