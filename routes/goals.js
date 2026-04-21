const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all goals
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM goals ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new goal
router.post('/', async (req, res) => {
  try {
    const { title, target_amount, saved_amount } = req.body;
    if (!title || !target_amount) {
      return res.status(400).json({ error: 'title and target_amount are required' });
    }
    const result = await pool.query(
      `INSERT INTO goals (title, target_amount, saved_amount)
       VALUES ($1, $2, $3) RETURNING *`,
      [title, target_amount, saved_amount || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update saved_amount for a goal
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { saved_amount } = req.body;
    const result = await pool.query(
      `UPDATE goals
       SET saved_amount=$1
       WHERE id=$2 RETURNING *`,
      [saved_amount, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a goal
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM goals WHERE id=$1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;