/*
Name: Isaac Euceda
Date: 2026-04-21
CSC 372-01
Description: This is the main server file for the Save It application. It sets up the Express server, configures middleware for CORS, JSON parsing, and session management using connect-pg-simple to store sessions in a PostgreSQL database. The server defines routes for authentication, transactions, goals, and quotes, as well as serving static files and protected pages. The server listens on a specified port for incoming requests.
*/
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./db');


const transactionsRouter = require('./routes/transactions');
const goalsRouter = require('./routes/goals');
const quotesRouter = require('./routes/quotes');
const authRouter = require('./routes/auth');
const { requireAuth, requireAuthPage } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Session setup — stored in Postgres via Neon
app.use(session({
store: new pgSession({
pool,
tableName: 'session',
createTableIfMissing: true, // auto-creates session table in Neon
}),
secret: process.env.SESSION_SECRET || 'changeme-use-a-real-secret',
resave: false,
saveUninitialized: false,
cookie: {
maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
httpOnly: true,
secure: process.env.NODE_ENV === 'production',
},
}));

app.use(express.static(path.join(__dirname, 'public')));

// Auth routes (public)
app.use('/api/auth', authRouter);

// Protected API routes
app.use('/api/transactions', transactionsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/quotes', quotesRouter);

// Public pages
app.get('/login', (req, res) => {
if (req.session.userId) return res.redirect('/');
res.sendFile(path.join(__dirname, 'public', 'pages', 'login.html'));
});
app.get('/register', (req, res) => {
if (req.session.userId) return res.redirect('/');
res.sendFile(path.join(__dirname, 'public', 'pages', 'register.html'));
});

// Protected pages
app.get('/', requireAuthPage, (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/positivity', requireAuthPage, (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'pages', 'positivity.html'));
});

app.listen(PORT, () => {
console.log(`Server running on http://localhost:${PORT}`);
});