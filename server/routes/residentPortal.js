const express = require('express');
const router = express.Router();
const { promisePool } = require('../database');

router.get('/:id/dashboard', async (req, res) => {
  try {
    const residentId = req.params.id;

    const [resident] = await promisePool.query(`
      SELECT r.*, h.hostel_name, h.location, h.contact_number, mp.plan_type, mp.cost
      FROM residents r
      LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
      LEFT JOIN mess_plans mp ON r.mess_plan_id = mp.plan_id
      WHERE r.resident_id = ?
    `, [residentId]);

    if (!resident.length) {
      return res.status(404).json({ error: 'Resident not found' });
    }

    const [room] = await promisePool.query(`
      SELECT a.*, rm.room_number, rm.room_type, rm.capacity, h.hostel_name, h.location
      FROM allotments a
      JOIN rooms rm ON a.room_id = rm.room_id
      JOIN hostels h ON rm.hostel_id = h.hostel_id
      WHERE a.resident_id = ? AND a.status = 'active'
      ORDER BY a.created_at DESC
      LIMIT 1
    `, [residentId]);

    const [bills, maintenance, laundry, hostels, messPlans, availableRooms] = await Promise.all([
      promisePool.query('SELECT * FROM bills WHERE resident_id = ? ORDER BY due_date DESC LIMIT 5', [residentId]),
      promisePool.query('SELECT * FROM maintenance_requests WHERE resident_id = ? ORDER BY created_at DESC LIMIT 5', [residentId]),
      promisePool.query('SELECT * FROM laundry_services WHERE resident_id = ? ORDER BY service_date DESC LIMIT 5', [residentId]),
      promisePool.query('SELECT * FROM hostels ORDER BY hostel_name'),
      promisePool.query('SELECT * FROM mess_plans ORDER BY plan_type'),
      promisePool.query(`
        SELECT r.*, h.hostel_name, h.location
        FROM rooms r
        JOIN hostels h ON r.hostel_id = h.hostel_id
        WHERE r.status = 'available'
        AND (r.hostel_id = ? OR ? IS NULL)
        AND r.roommate_type = ?
        ORDER BY h.hostel_name, r.room_number
      `, [resident[0].hostel_id, resident[0].hostel_id, resident[0].roommate_type])
    ]);

    res.json({
      resident: resident[0],
      room: room.length ? room[0] : null,
      bills: bills[0],
      maintenance: maintenance[0],
      laundry: laundry[0],
      hostels: hostels[0],
      messPlans: messPlans[0],
      availableRooms: availableRooms[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/profile', async (req, res) => {
  try {
    const residentId = req.params.id;
    const {
      name,
      gender,
      contact_number,
      emergency_contact,
      email,
      hostel_id,
      mess_plan_id,
      roommate_type
    } = req.body;

    const [result] = await promisePool.query(
      `UPDATE residents
       SET name=?, gender=?, contact_number=?, emergency_contact=?, email=?, hostel_id=?, mess_plan_id=?, roommate_type=?
       WHERE resident_id=?`,
      [
        name,
        gender,
        parseInt(contact_number) || null,
        emergency_contact ? parseInt(emergency_contact) : null,
        email || null,
        hostel_id || null,
        mess_plan_id || null,
        roommate_type || 'quiet',
        residentId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Resident not found' });
    }

    const [updatedResident] = await promisePool.query(
      `SELECT r.*, h.hostel_name, h.location, mp.plan_type, mp.cost
       FROM residents r
       LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
       LEFT JOIN mess_plans mp ON r.mess_plan_id = mp.plan_id
       WHERE r.resident_id = ?`,
      [residentId]
    );

    res.json(updatedResident[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/maintenance', async (req, res) => {
  try {
    const { issue_description } = req.body;
    if (!issue_description) {
      return res.status(400).json({ error: 'Issue description is required' });
    }
    const [result] = await promisePool.query(
      'INSERT INTO maintenance_requests (resident_id, issue_description) VALUES (?, ?)',
      [req.params.id, issue_description]
    );
    const [request] = await promisePool.query('SELECT * FROM maintenance_requests WHERE request_id = ?', [result.insertId]);
    res.status(201).json(request[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/laundry', async (req, res) => {
  try {
    const { service_date } = req.body;
    const date = service_date || new Date().toISOString().split('T')[0];
    const [result] = await promisePool.query(
      'INSERT INTO laundry_services (resident_id, service_date, status) VALUES (?, ?, ?)',
      [req.params.id, date, 'requested']
    );
    const [laundry] = await promisePool.query('SELECT * FROM laundry_services WHERE laundry_id = ?', [result.insertId]);
    res.status(201).json(laundry[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/room-selection', async (req, res) => {
  try {
    const residentId = req.params.id;
    const { room_id } = req.body;

    if (!room_id) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    // Check if resident already has an active allocation
    const [existingAllocation] = await promisePool.query(
      'SELECT * FROM allotments WHERE resident_id = ? AND status = "active"',
      [residentId]
    );

    if (existingAllocation.length > 0) {
      return res.status(400).json({ error: 'Resident already has an active room allocation' });
    }

    // Check if room is available
    const [room] = await promisePool.query('SELECT * FROM rooms WHERE room_id = ?', [room_id]);
    if (room.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room[0].status !== 'available') {
      return res.status(400).json({ error: 'Room is not available' });
    }

    if (room[0].occupied >= room[0].capacity) {
      return res.status(400).json({ error: 'Room is full' });
    }

    // Start transaction
    const connection = await promisePool.getConnection();
    await connection.beginTransaction();

    try {
      // Create allotment
      const [result] = await connection.query(
        'INSERT INTO allotments (resident_id, room_id, check_in_date) VALUES (?, ?, ?)',
        [residentId, room_id, new Date().toISOString().split('T')[0]]
      );

      // Update room occupied count
      await connection.query(
        'UPDATE rooms SET occupied = occupied + 1 WHERE room_id = ?',
        [room_id]
      );

      // Update room status if full
      await connection.query(
        'UPDATE rooms SET status = CASE WHEN occupied + 1 >= capacity THEN "full" ELSE "available" END WHERE room_id = ?',
        [room_id]
      );

      await connection.commit();

      const [newAllocation] = await promisePool.query(`
        SELECT a.*, rm.room_number, rm.room_type, rm.capacity, h.hostel_name, h.location
        FROM allotments a
        JOIN rooms rm ON a.room_id = rm.room_id
        JOIN hostels h ON rm.hostel_id = h.hostel_id
        WHERE a.allotment_id = ?
      `, [result.insertId]);

      res.status(201).json(newAllocation[0]);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

