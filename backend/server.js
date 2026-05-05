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

/// 1. Login Route (Now with Password Verification)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }
        
        // Check for BOTH email and password matching
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ? LIMIT 1', [email, password]);
        
        if (rows.length > 0) {
            // Remove the password from the data before sending it to the React frontend
            const { password, ...userWithoutPassword } = rows[0];
            res.json(userWithoutPassword);
        } else {
            res.status(401).json({ message: "Invalid email or password" });
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

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================
const verifyAdmin = async (req, res, next) => {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: No user ID provided" });
    }

    try {
        const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [userId]);
        if (rows.length > 0 && rows[0].role === 'Admin') {
            next(); // User is an admin, allow the request to proceed
        } else {
            res.status(403).json({ message: "Forbidden: Admin access required" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==========================================
// ADMIN & TECH TEAM ROUTES (PHASE 2)
// ==========================================

// 4. Get ALL Tickets (Master Queue for Admins) - NOW PROTECTED
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

// 5. Update Ticket (Status, Priority, Assignee) + Audit Logging
app.put('/api/tickets/:id', verifyAdmin, async (req, res) => {
    const ticketId = req.params.id;
    const { status, priority, assigned_to, user_name, action_description } = req.body;

    try {
        // 1. Update the ticket
        await pool.query(
            'UPDATE tickets SET status = ?, priority = ?, assigned_to = ? WHERE id = ?',
            [status, priority, assigned_to || null, ticketId]
        );
        
        // 2. Log the activity automatically
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

// Get Activity Logs for a specific ticket
app.get('/api/tickets/:id/logs', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM activity_logs WHERE ticket_id = ? ORDER BY created_at DESC', [req.params.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Add a Comment/Internal Note to a Ticket
app.post('/api/tickets/:id/comments', async (req, res) => {
    const ticketId = req.params.id;
    const { userId, content, isInternal } = req.body;

    try {
        const [result] = await pool.query(
            'INSERT INTO comments (ticket_id, user_id, content, is_internal) VALUES (?, ?, ?, ?)',
            [ticketId, userId, content, isInternal || false]
        );
        
        // Fetch the newly created comment with the author's name to send back to React
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

// 7. Get All Comments for a Specific Ticket
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

// Get all Admins/Techs for the assignment dropdown
app.get('/api/admin/techs', verifyAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name FROM users WHERE role = "Admin"');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});