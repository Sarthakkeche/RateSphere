// File: server/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();
const express = require('express');
// ... the rest of your index.js code
const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = process.env.JWT_SECRET;

// Middleware to Verify JWT Token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: "Token required" });
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid Token" });
    }
};

// --- AUTHENTICATION ROUTES ---

// 1. Public Signup
app.post('/auth/signup', async (req, res) => {
    const { name, email, password, address, role } = req.body;
    
    // Validations matching frontend
    if (name.length < 4 || name.length > 60) return res.status(400).json({ message: "Name must be 4-60 chars" });
    if (address.length > 400) return res.status(400).json({ message: "Address max 400 chars" });
    const passRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).{2,16}$/;
    if (!passRegex.test(password)) return res.status(400).json({ message: "Invalid password format" });

    // Ensure normal users cannot create admin accounts via public signup
    const assignedRole = (role === 'owner') ? 'owner' : 'user';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)', 
            [name, email, hashedPassword, address, assignedRole]
        );
        res.status(201).json({ message: "User registered" });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "Email already exists" });
        res.status(500).json({ message: err.message });
    }
});

// 2. Login
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(404).json({ message: "User not found" });
    
    const user = users[0];
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY);
    res.json({ token, role: user.role });
});

// 3. Update Password
app.put('/users/password', verifyToken, async (req, res) => {
    const { newPassword } = req.body;
    const passRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).{2,16}$/;
    if (!passRegex.test(newPassword)) return res.status(400).json({ message: "Invalid password format" });

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating password" });
    }
});

// --- ADMIN ROUTES ---

// 4. Admin Dashboard Stats
app.get('/dashboard/stats', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Access denied" });
    const [uCount] = await db.execute('SELECT COUNT(*) as count FROM users');
    const [sCount] = await db.execute('SELECT COUNT(*) as count FROM stores');
    const [rCount] = await db.execute('SELECT COUNT(*) as count FROM ratings');
    res.json({ users: uCount[0].count, stores: sCount[0].count, ratings: rCount[0].count });
});

// 5. Admin View Users
app.get('/admin/users', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Access denied" });
    // Join with stores and ratings to calculate their store's rating if they are an owner
    const [users] = await db.execute(`
        SELECT u.id, u.name, u.email, u.address, u.role, AVG(r.rating) as store_rating
        FROM users u
        LEFT JOIN stores s ON u.id = s.owner_id
        LEFT JOIN ratings r ON s.id = r.store_id
        GROUP BY u.id
    `);
    res.json(users);
});

// 6. Admin View Stores
app.get('/admin/stores', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Access denied" });
    const [stores] = await db.execute('SELECT * FROM stores');
    res.json(stores);
});

// 7. Admin Add Internal User (Admin/User)
app.post('/admin/users', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Access denied" });
    const { name, email, password, address, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)', 
            [name, email, hashedPassword, address, role]
        );
        res.status(201).json({ message: "Internal user created" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 8. Admin Add Store (Assigns Owner by Email)
app.post('/admin/stores', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Access denied" });
    const { name, email, address, owner_email } = req.body;
    
    try {
        // Find the owner ID by email
        const [owners] = await db.execute('SELECT id FROM users WHERE email = ? AND role = "owner"', [owner_email]);
        if (owners.length === 0) return res.status(404).json({ message: "Owner not found. Ensure the email belongs to a registered 'Store Owner'." });
        
        const owner_id = owners[0].id;
        await db.execute(
            'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)', 
            [name, email, address, owner_id]
        );
        res.status(201).json({ message: "Store added successfully" });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "Store email already exists" });
        res.status(500).json({ message: err.message });
    }
});

// --- OWNER ROUTES ---

// 9. Owner Dashboard
app.get('/owner/dashboard', verifyToken, async (req, res) => {
    if (req.user.role !== 'owner') return res.status(403).json({ message: "Access denied" });

    try {
        // Find the store assigned to this owner
        const [stores] = await db.execute(`
            SELECT s.*, AVG(r.rating) as avg_rating 
            FROM stores s 
            LEFT JOIN ratings r ON s.id = r.store_id 
            WHERE s.owner_id = ? 
            GROUP BY s.id
        `, [req.user.id]);

        if (stores.length === 0) return res.json(null); // No store assigned yet

        const store = stores[0];

        // Get all users who rated this store
        const [ratings] = await db.execute(`
            SELECT r.rating, u.name as user_name, u.email as user_email
            FROM ratings r
            JOIN users u ON r.user_id = u.id
            WHERE r.store_id = ?
            ORDER BY r.created_at DESC
        `, [store.id]);

        res.json({ store, ratings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- NORMAL USER ROUTES ---

// 10. Get Stores (Includes the user's previously submitted rating)
app.get('/stores', verifyToken, async (req, res) => {
    try {
        const [stores] = await db.execute(`
            SELECT s.*, 
                   AVG(r.rating) as avg_rating,
                   (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = ?) as user_submitted_rating
            FROM stores s 
            LEFT JOIN ratings r ON s.id = r.store_id 
            GROUP BY s.id
        `, [req.user.id]);
        res.json(stores);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Forgot Password (Public Route)
app.put('/auth/forgot-password', async (req, res) => {
    const { email, newPassword } = req.body;
    
    // Enforce PDF password rules
    const passRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).{8,16}$/;
    if (!passRegex.test(newPassword)) return res.status(400).json({ message: "Invalid password format" });

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const [result] = await db.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
        
        if (result.affectedRows === 0) return res.status(404).json({ message: "Email not found" });
        
        res.json({ message: "Password reset successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error resetting password" });
    }
});

// 11. Submit/Update Rating
app.post('/ratings', verifyToken, async (req, res) => {
    const { storeId, rating } = req.body;
    try {
        await db.execute(`
            INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE rating = ?`, 
            [req.user.id, storeId, rating, rating]
        );
        res.json({ message: "Rating submitted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(5000, () => console.log('✅ Server running on port 5000'));