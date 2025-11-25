const express = require('express');
const router = express.Router();
const { promisePool } = require('../database');

// Get all students
router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM students ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new student
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, enrollment_number, course, year } = req.body;
    
    if (!name || !email || !enrollment_number) {
      return res.status(400).json({ error: 'Name, email, and enrollment number are required' });
    }

    const [result] = await promisePool.query(
      'INSERT INTO students (name, email, phone, enrollment_number, course, year) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone || null, enrollment_number, course || null, year || null]
    );

    const [newStudent] = await promisePool.query('SELECT * FROM students WHERE id = ?', [result.insertId]);
    res.status(201).json(newStudent[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email or enrollment number already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, enrollment_number, course, year } = req.body;
    
    const [result] = await promisePool.query(
      'UPDATE students SET name = ?, email = ?, phone = ?, enrollment_number = ?, course = ?, year = ? WHERE id = ?',
      [name, email, phone, enrollment_number, course, year, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const [updatedStudent] = await promisePool.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    res.json(updatedStudent[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email or enrollment number already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

