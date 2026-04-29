const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 1. Mock Login Route (Returns our mock user)
app.post('/api/login', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users LIMIT 1');
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Get User's Tickets
app.get('/api/tickets/:userId', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC', 
            [req.params.userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Create a New Ticket
app.post('/api/tickets', async (req, res) => {
    const { userId, category, details, priority } = req.body;
    const ticketRef = `TKT-${Math.floor(Math.random() * 90000) + 10000}`; // Generate ID

    try {
        const [result] = await pool.query(
            'INSERT INTO tickets (ticket_ref, user_id, category, details, priority) VALUES (?, ?, ?, ?, ?)',
            [ticketRef, userId, category, details, priority]
        );
        
        // Fetch the newly created ticket to return to frontend
        const [newTicket] = await pool.query('SELECT * FROM tickets WHERE id = ?', [result.insertId]);
        res.status(201).json(newTicket[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});