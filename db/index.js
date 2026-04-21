/*
Name: Isaac Euceda
Date: 2026-04-21
CSC 372-01
Description: This file sets up the connection to the PostgreSQL database using the pg library. It also initializes the database by creating the necessary tables for users, transactions, and goals if they do not already exist.
*/
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                category VARCHAR(50) NOT NULL,
                date DATE NOT NULL DEFAULT CURRENT_DATE,
                created_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS goals (
                id SERIAL PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                target_amount DECIMAL(10, 2) NOT NULL,
                saved_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Database initialized');
    } catch (err) {
        console.error('Error initializing database:', err.message);
    }
};

initDb();

module.exports = pool;