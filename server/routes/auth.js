const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { hashPassword, comparePassword, generateToken } = require('../auth');
const { authenticate } = require('../middleware');

// POST /register
router.post('/register', (req, res) => {
  try {
    const { email, password, businessName, trade } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDB();

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const password_hash = hashPassword(password);
    const result = db.prepare(
      'INSERT INTO users (email, password_hash, business_name, trade) VALUES (?, ?, ?, ?)'
    ).run(email, password_hash, businessName || null, trade || null);

    const token = generateToken(result.lastInsertRowid);

    res.status(201).json({
      token,
      user: {
        id: result.lastInsertRowid,
        email,
        businessName: businessName || null,
        trade: trade || null
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user || !comparePassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        businessName: user.business_name,
        trade: user.trade
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /me
router.get('/me', authenticate, (req, res) => {
  try {
    const db = getDB();
    const user = db.prepare('SELECT id, email, business_name, trade, created_at FROM users WHERE id = ?').get(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        businessName: user.business_name,
        trade: user.trade,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
