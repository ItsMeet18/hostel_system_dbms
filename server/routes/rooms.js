const express = require('express');
const router = express.Router();
const { promisePool } = require('../database');

// Get all rooms with hostel info
router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT r.*, h.hostel_name
       FROM rooms r
       JOIN hostels h ON r.hostel_id = h.hostel_id
       ORDER BY h.hostel_name, r.room_number`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get room by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT r.*, h.hostel_name
       FROM rooms r
       JOIN hostels h ON r.hostel_id = h.hostel_id
       WHERE r.room_id = ?`,
      [req.params.id]
    );
    if (!rows.length) {
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
    const { hostel_id, room_number, room_type, capacity, status } = req.body;

    if (!hostel_id || !room_number || !capacity) {
      return res.status(400).json({ error: 'Hostel, room number and capacity are required' });
    }

    const [result] = await promisePool.query(
      `INSERT INTO rooms (hostel_id, room_number, room_type, capacity, status)
       VALUES (?, ?, ?, ?, ?)`,
      [hostel_id, room_number, room_type || 'double', capacity, status || 'available']
    );

    const [room] = await promisePool.query('SELECT * FROM rooms WHERE room_id = ?', [result.insertId]);
    res.status(201).json(room[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Room number already exists in this hostel' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update room
router.put('/:id', async (req, res) => {
  try {
    const { hostel_id, room_number, room_type, capacity, status, occupied } = req.body;

    const [result] = await promisePool.query(
      `UPDATE rooms SET hostel_id=?, room_number=?, room_type=?, capacity=?, status=?, occupied=? WHERE room_id=?`,
      [hostel_id, room_number, room_type, capacity, status, occupied || 0, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const [room] = await promisePool.query('SELECT * FROM rooms WHERE room_id = ?', [req.params.id]);
    res.json(room[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete room
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query('DELETE FROM rooms WHERE room_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

