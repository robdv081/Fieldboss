const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

// GET / — list customers
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const { search } = req.query;

    let query = 'SELECT * FROM customers WHERE user_id = ?';
    const params = [req.userId];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR address LIKE ? OR city LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    query += ' ORDER BY created_at DESC';
    const customers = db.prepare(query).all(...params);
    res.json(customers);
  } catch (err) {
    console.error('List customers error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /:id — get single customer
router.get('/:id', (req, res) => {
  try {
    const db = getDB();
    const customer = db.prepare('SELECT * FROM customers WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (err) {
    console.error('Get customer error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST / — create customer
router.post('/', (req, res) => {
  try {
    const db = getDB();
    const { name, email, phone, address, city, state, zip, notes, source } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = db.prepare(
      `INSERT INTO customers (user_id, name, email, phone, address, city, state, zip, notes, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(req.userId, name, email || null, phone || null, address || null, city || null, state || null, zip || null, notes || null, source || null);

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(customer);
  } catch (err) {
    console.error('Create customer error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /:id — update customer
router.put('/:id', (req, res) => {
  try {
    const db = getDB();

    // Verify ownership
    const existing = db.prepare('SELECT id FROM customers WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const { name, email, phone, address, city, state, zip, notes, source } = req.body;

    db.prepare(
      `UPDATE customers SET name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, zip = ?, notes = ?, source = ?, updated_at = datetime('now')
       WHERE id = ? AND user_id = ?`
    ).run(name, email || null, phone || null, address || null, city || null, state || null, zip || null, notes || null, source || null, req.params.id, req.userId);

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    res.json(customer);
  } catch (err) {
    console.error('Update customer error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /:id — delete customer
router.delete('/:id', (req, res) => {
  try {
    const db = getDB();

    const result = db.prepare('DELETE FROM customers WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted' });
  } catch (err) {
    console.error('Delete customer error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
