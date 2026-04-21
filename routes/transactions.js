const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all transactions (optionally filter by week or month)
router.get('/', async (req, res) => {
  try {
    const { range } = req.query; // 'week' or 'month'

    let dateFilter = '';
    if (range === 'week') {
      dateFilter = `WHERE date >= CURRENT_DATE - INTERVAL '6 days'`;
    } else if (range === 'month') {
      dateFilter = `WHERE date >= CURRENT_DATE - INTERVAL '29 days'`;
    }

    const result = await pool.query(
      `SELECT * FROM transactions ${dateFilter} ORDER BY date DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET spending grouped by category (for pie chart)
router.get('/summary', async (req, res) => {
  try {
    const { range } = req.query;

    let dateFilter = '';
    if (range === 'week') {
      dateFilter = `WHERE date >= CURRENT_DATE - INTERVAL '6 days'`;
    } else if (range === 'month') {
      dateFilter = `WHERE date >= CURRENT_DATE - INTERVAL '29 days'`;
    }

    const result = await pool.query(`
      SELECT category, SUM(amount) AS total
      FROM transactions
      ${dateFilter}
      GROUP BY category
      ORDER BY total DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new transaction
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({ error: 'title, amount, and category are required' });
    }

    const result = await pool.query(
      `INSERT INTO transactions (title, amount, category, date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, amount, category, date || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a transaction
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date } = req.body;

    const result = await pool.query(
      `UPDATE transactions
       SET title=$1, amount=$2, category=$3, date=$4
       WHERE id=$5 RETURNING *`,
      [title, amount, category, date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM transactions WHERE id=$1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;