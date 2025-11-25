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

    const [bills, maintenance, laundry] = await Promise.all([
      promisePool.query('SELECT * FROM bills WHERE resident_id = ? ORDER BY due_date DESC LIMIT 5', [residentId]),
      promisePool.query('SELECT * FROM maintenance_requests WHERE resident_id = ? ORDER BY created_at DESC LIMIT 5', [residentId]),
      promisePool.query('SELECT * FROM laundry_services WHERE resident_id = ? ORDER BY service_date DESC LIMIT 5', [residentId])
    ]);

    res.json({
      resident: resident[0],
      room: room.length ? room[0] : null,
      bills: bills[0],
      maintenance: maintenance[0],
      laundry: laundry[0]
    });
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

module.exports = router;

