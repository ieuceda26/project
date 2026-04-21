const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const e = require('express');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
try {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    if (password.length < 5) {
        return res.status(400).json({ error: 'Password must be at least 5 characters' });
    }
    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
        [username, password_hash]
    );
    const user = result.rows[0];
    req.session.userId = user.id; // Log in the user immediately after registration
    req.session.username = user.username;
    res.status(201).json({ id: user.id, username: user.username });
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

// Login existing user
router.post('/login', async (req, res) => {
    try {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    const result = await pool.query('SELECT id, username, password_hash FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid username or password' });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        return res.status(400).json({ error: 'Invalid username or password' });
    }
    req.session.userId = user.id;
    req.session.username = user.username;
    res.json({ id: user.id, username: user.username });
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

// Logout user
router.post('/logout', (req, res) => {
req.session.destroy(() => {
    res.json({ message: 'Logged out successfully' });
});
});
router.get('/me', (req, res) => {
if (req.session && req.session.userId) {
    res.json({ id: req.session.userId, username: req.session.username });
} else {
    res.status(401).json({ error: 'Not authenticated' });
}
});

module.exports = router;
