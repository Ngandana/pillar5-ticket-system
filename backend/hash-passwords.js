const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function migratePasswords() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST, user: process.env.DB_USER,
        password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    });

    try {
        console.log("Fetching users...");
        const [users] = await pool.query('SELECT id, password FROM users');
        
        for (let user of users) {
            // Only hash it if it's not already hashed (bcrypt hashes start with $2b$)
            if (!user.password.startsWith('$2b$')) {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
                console.log(`Updated password for user ID: ${user.id}`);
            }
        }
        console.log("Migration complete! You can delete this file now.");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
migratePasswords();