const express = require('express');
const router = express.Router();
const { promisePool } = require('../database');

// Get all allocations with student and room details
router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT 
        a.id,
        a.allocation_date,
        a.status,
        s.id as student_id,
        s.name as student_name,
        s.email as student_email,
        s.enrollment_number,
        r.id as room_id,
        r.room_number,
        r.floor,
        r.capacity,
        r.occupied
      FROM allocations a
      JOIN students s ON a.student_id = s.id
      JOIN rooms r ON a.room_id = r.id
      ORDER BY a.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get allocation by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT 
        a.id,
        a.allocation_date,
        a.status,
        s.id as student_id,
        s.name as student_name,
        s.email as student_email,
        s.enrollment_number,
        r.id as room_id,
        r.room_number,
        r.floor,
        r.capacity,
        r.occupied
      FROM allocations a
      JOIN students s ON a.student_id = s.id
      JOIN rooms r ON a.room_id = r.id
      WHERE a.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Allocation not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new allocation
router.post('/', async (req, res) => {
  try {
    const { student_id, room_id, allocation_date } = req.body;
    
    if (!student_id || !room_id || !allocation_date) {
      return res.status(400).json({ error: 'Student ID, room ID, and allocation date are required' });
    }

    // Check if student already has an active allocation
    const [existingAllocation] = await promisePool.query(
      'SELECT * FROM allocations WHERE student_id = ? AND status = "active"',
      [student_id]
    );

    if (existingAllocation.length > 0) {
      return res.status(400).json({ error: 'Student already has an active allocation' });
    }

    // Check room capacity
    const [room] = await promisePool.query('SELECT * FROM rooms WHERE id = ?', [room_id]);
    if (room.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room[0].occupied >= room[0].capacity) {
      return res.status(400).json({ error: 'Room is full' });
    }

    if (room[0].status !== 'available') {
      return res.status(400).json({ error: 'Room is not available' });
    }

    // Start transaction
    const connection = await promisePool.getConnection();
    await connection.beginTransaction();

    try {
      // Create allocation
      const [result] = await connection.query(
        'INSERT INTO allocations (student_id, room_id, allocation_date) VALUES (?, ?, ?)',
        [student_id, room_id, allocation_date]
      );

      // Update room occupied count
      await connection.query(
        'UPDATE rooms SET occupied = occupied + 1 WHERE id = ?',
        [room_id]
      );

      // Update room status if full
      await connection.query(
        'UPDATE rooms SET status = CASE WHEN occupied + 1 >= capacity THEN "full" ELSE "available" END WHERE id = ?',
        [room_id]
      );

      await connection.commit();

      const [newAllocation] = await promisePool.query(`
        SELECT 
          a.id,
          a.allocation_date,
          a.status,
          s.id as student_id,
          s.name as student_name,
          s.email as student_email,
          s.enrollment_number,
          r.id as room_id,
          r.room_number,
          r.floor,
          r.capacity,
          r.occupied
        FROM allocations a
        JOIN students s ON a.student_id = s.id
        JOIN rooms r ON a.room_id = r.id
        WHERE a.id = ?
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

// Update allocation (mainly to complete it)
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Get current allocation
    const [allocation] = await promisePool.query('SELECT * FROM allocations WHERE id = ?', [req.params.id]);
    if (allocation.length === 0) {
      return res.status(404).json({ error: 'Allocation not found' });
    }

    const connection = await promisePool.getConnection();
    await connection.beginTransaction();

    try {
      // Update allocation status
      await connection.query('UPDATE allocations SET status = ? WHERE id = ?', [status, req.params.id]);

      // If completing allocation, update room
      if (status === 'completed' && allocation[0].status === 'active') {
        await connection.query(
          'UPDATE rooms SET occupied = occupied - 1 WHERE id = ?',
          [allocation[0].room_id]
        );

        await connection.query(
          'UPDATE rooms SET status = "available" WHERE id = ?',
          [allocation[0].room_id]
        );
      }

      await connection.commit();

      const [updatedAllocation] = await promisePool.query(`
        SELECT 
          a.id,
          a.allocation_date,
          a.status,
          s.id as student_id,
          s.name as student_name,
          s.email as student_email,
          s.enrollment_number,
          r.id as room_id,
          r.room_number,
          r.floor,
          r.capacity,
          r.occupied
        FROM allocations a
        JOIN students s ON a.student_id = s.id
        JOIN rooms r ON a.room_id = r.id
        WHERE a.id = ?
      `, [req.params.id]);

      res.json(updatedAllocation[0]);
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

// Delete allocation
router.delete('/:id', async (req, res) => {
  try {
    // Get allocation details before deletion
    const [allocation] = await promisePool.query('SELECT * FROM allocations WHERE id = ?', [req.params.id]);
    
    if (allocation.length === 0) {
      return res.status(404).json({ error: 'Allocation not found' });
    }

    const connection = await promisePool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete allocation
      await connection.query('DELETE FROM allocations WHERE id = ?', [req.params.id]);

      // Update room if allocation was active
      if (allocation[0].status === 'active') {
        await connection.query(
          'UPDATE rooms SET occupied = occupied - 1 WHERE id = ?',
          [allocation[0].room_id]
        );

        await connection.query(
          'UPDATE rooms SET status = "available" WHERE id = ?',
          [allocation[0].room_id]
        );
      }

      await connection.commit();
      res.json({ message: 'Allocation deleted successfully' });
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

