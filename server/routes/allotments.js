const express = require('express');
const router = express.Router();
const { promisePool } = require('../database');

async function updateRoomOccupancy(roomId) {
  await promisePool.query(
    `UPDATE rooms SET 
      occupied = (SELECT COUNT(*) FROM allotments WHERE room_id = ? AND status = 'active'),
      status = CASE
        WHEN capacity <= (SELECT COUNT(*) FROM allotments WHERE room_id = ? AND status = 'active') THEN 'full'
        ELSE 'available'
      END
     WHERE room_id = ?`,
    [roomId, roomId, roomId]
  );
}

// Get all allotments
router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT a.*, 
             r.name AS resident_name,
             rm.room_number,
             rm.room_type,
             h.hostel_name
      FROM allotments a
      JOIN residents r ON a.resident_id = r.resident_id
      JOIN rooms rm ON a.room_id = rm.room_id
      JOIN hostels h ON rm.hostel_id = h.hostel_id
      ORDER BY a.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create allotment
router.post('/', async (req, res) => {
  try {
    const { resident_id, room_id, check_in_date, lifestyle_preference } = req.body;

    if (!resident_id || !room_id || !check_in_date) {
      return res.status(400).json({ error: 'Resident, room and check-in date are required' });
    }

    // Check active allotment
    const [active] = await promisePool.query(
      'SELECT * FROM allotments WHERE resident_id = ? AND status = "active"',
      [resident_id]
    );
    if (active.length) {
      return res.status(400).json({ error: 'Resident already has an active allotment' });
    }

    // Check room capacity
    const [room] = await promisePool.query(
      'SELECT capacity, occupied, status FROM rooms WHERE room_id = ?',
      [room_id]
    );

    if (!room.length) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room[0].occupied >= room[0].capacity || room[0].status === 'full') {
      return res.status(400).json({ error: 'Room is full' });
    }

    const [result] = await promisePool.query(
      `INSERT INTO allotments (resident_id, room_id, check_in_date, lifestyle_preference)
       VALUES (?, ?, ?, ?)`,
      [resident_id, room_id, check_in_date, lifestyle_preference || 'quiet']
    );

    await updateRoomOccupancy(room_id);

    const [allotment] = await promisePool.query('SELECT * FROM allotments WHERE allotment_id = ?', [result.insertId]);
    res.status(201).json(allotment[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update allotment
router.put('/:id', async (req, res) => {
  try {
    const { check_in_date, check_out_date, lifestyle_preference, status } = req.body;

    const [existing] = await promisePool.query('SELECT * FROM allotments WHERE allotment_id = ?', [req.params.id]);
    if (!existing.length) {
      return res.status(404).json({ error: 'Allotment not found' });
    }

    const [result] = await promisePool.query(
      `UPDATE allotments SET check_in_date=?, check_out_date=?, lifestyle_preference=?, status=? WHERE allotment_id=?`,
      [
        check_in_date || existing[0].check_in_date,
        check_out_date || existing[0].check_out_date,
        lifestyle_preference || existing[0].lifestyle_preference,
        status || existing[0].status,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Allotment not found' });
    }

    await updateRoomOccupancy(existing[0].room_id);

    const [allotment] = await promisePool.query('SELECT * FROM allotments WHERE allotment_id = ?', [req.params.id]);
    res.json(allotment[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete allotment
router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await promisePool.query('SELECT * FROM allotments WHERE allotment_id = ?', [req.params.id]);
    if (!existing.length) {
      return res.status(404).json({ error: 'Allotment not found' });
    }

    const [result] = await promisePool.query('DELETE FROM allotments WHERE allotment_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Allotment not found' });
    }

    await updateRoomOccupancy(existing[0].room_id);
    res.json({ message: 'Allotment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

