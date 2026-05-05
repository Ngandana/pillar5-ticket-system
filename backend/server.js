const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');           // Required for password hashing
const jwt = require('jsonwebtoken');        // Required for secure tokens
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

// ==========================================
// 1. SECURE LOGIN ROUTE
// ==========================================
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and password required" });

        const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);

        if (rows.length > 0) {
            const user = rows[0];
            
            // Verify Password
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) return res.status(401).json({ message: "Invalid email or password" });

            // Generate Secure Token
            const token = jwt.sign(
                { id: user.id, role: user.role, name: user.name },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            // Remove password before sending to frontend
            const { password: dbPassword, ...userWithoutPassword } = user;
            res.json({ token, user: userWithoutPassword });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 2. SECURE JWT MIDDLEWARE (THE BOUNCER)
// ==========================================
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
        if (err) return res.status(403).json({ message: "Forbidden: Invalid or expired token" });

        if (decodedUser.role === 'Admin') {
            req.user = decodedUser;
            next();
        } else {
            res.status(403).json({ message: "Forbidden: Admin access required" });
        }
    });
};

// ==========================================
// 3. EMPLOYEE ROUTES
// ==========================================
app.get('/api/tickets/:userId', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tickets', async (req, res) => {
    const { userId, category, details, priority } = req.body;
    const ticketRef = `TKT-${Math.floor(Math.random() * 90000) + 10000}`;
    try {
        const [result] = await pool.query(
            'INSERT INTO tickets (ticket_ref, user_id, category, details, priority) VALUES (?, ?, ?, ?, ?)',
            [ticketRef, userId, category, details, priority]
        );
        const [newTicket] = await pool.query('SELECT * FROM tickets WHERE id = ?', [result.insertId]);
        res.status(201).json(newTicket[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 4. ADMIN & TECH TEAM ROUTES
// ==========================================
app.get('/api/admin/tickets', verifyAdmin, async (req, res) => {
    try {
        const query = `
            SELECT t.*, u.name as requester_name, a.name as assignee_name
            FROM tickets t
            JOIN users u ON t.user_id = u.id
            LEFT JOIN users a ON t.assigned_to = a.id
            ORDER BY t.created_at DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/tickets/:id', verifyAdmin, async (req, res) => {
    const ticketId = req.params.id;
    const { status, priority, assigned_to, user_name, action_description } = req.body;
    try {
        await pool.query(
            'UPDATE tickets SET status = ?, priority = ?, assigned_to = ? WHERE id = ?',
            [status, priority, assigned_to || null, ticketId]
        );
        if (action_description) {
            await pool.query(
                'INSERT INTO activity_logs (ticket_id, user_name, action) VALUES (?, ?, ?)',
                [ticketId, user_name, action_description]
            );
        }
        res.json({ message: "Ticket updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/tickets/:id/logs', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM activity_logs WHERE ticket_id = ? ORDER BY created_at DESC', [req.params.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/techs', verifyAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name FROM users WHERE role = "Admin"');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 5. SHARED COMMUNICATION ROUTES
// ==========================================
app.post('/api/tickets/:id/comments', async (req, res) => {
    const ticketId = req.params.id;
    const { userId, content, isInternal } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO comments (ticket_id, user_id, content, is_internal) VALUES (?, ?, ?, ?)',
            [ticketId, userId, content, isInternal || false]
        );
        const [newComment] = await pool.query(`
            SELECT c.*, u.name as author_name, u.role as author_role
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?`,
            [result.insertId]
        );
        res.status(201).json(newComment[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/tickets/:id/comments', async (req, res) => {
    const ticketId = req.params.id;
    try {
        const [rows] = await pool.query(`
            SELECT c.*, u.name as author_name, u.role as author_role
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.ticket_id = ?
            ORDER BY c.created_at ASC`,
            [ticketId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});