const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

// GET / — list estimates
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const { search, status } = req.query;

    let query = `SELECT e.*, c.name as customer_name
                 FROM estimates e
                 LEFT JOIN customers c ON e.customer_id = c.id
                 WHERE e.user_id = ?`;
    const params = [req.userId];

    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (e.title LIKE ? OR e.notes LIKE ? OR c.name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY e.created_at DESC';
    const estimates = db.prepare(query).all(...params);
    res.json(estimates);
  } catch (err) {
    console.error('List estimates error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST / — create estimate
router.post('/', (req, res) => {
  try {
    const db = getDB();
    const { customer_id, job_id, title, items, subtotal, tax_rate, tax, total, status, notes, valid_until } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const itemsJson = items ? (typeof items === 'string' ? items : JSON.stringify(items)) : null;

    const result = db.prepare(
      `INSERT INTO estimates (user_id, customer_id, job_id, title, items, subtotal, tax_rate, tax, total, status, notes, valid_until)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      req.userId, customer_id || null, job_id || null, title, itemsJson,
      subtotal || 0, tax_rate || 0, tax || 0, total || 0,
      status || 'draft', notes || null, valid_until || null
    );

    const estimate = db.prepare(
      `SELECT e.*, c.name as customer_name
       FROM estimates e
       LEFT JOIN customers c ON e.customer_id = c.id
       WHERE e.id = ?`
    ).get(result.lastInsertRowid);

    res.status(201).json(estimate);
  } catch (err) {
    console.error('Create estimate error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /:id — update estimate
router.put('/:id', (req, res) => {
  try {
    const db = getDB();

    const existing = db.prepare('SELECT id FROM estimates WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    const { customer_id, job_id, title, items, subtotal, tax_rate, tax, total, status, notes, valid_until } = req.body;

    const itemsJson = items ? (typeof items === 'string' ? items : JSON.stringify(items)) : null;

    db.prepare(
      `UPDATE estimates SET customer_id = ?, job_id = ?, title = ?, items = ?, subtotal = ?, tax_rate = ?, tax = ?, total = ?, status = ?, notes = ?, valid_until = ?
       WHERE id = ? AND user_id = ?`
    ).run(
      customer_id || null, job_id || null, title, itemsJson,
      subtotal || 0, tax_rate || 0, tax || 0, total || 0,
      status || 'draft', notes || null, valid_until || null,
      req.params.id, req.userId
    );

    const estimate = db.prepare(
      `SELECT e.*, c.name as customer_name
       FROM estimates e
       LEFT JOIN customers c ON e.customer_id = c.id
       WHERE e.id = ?`
    ).get(req.params.id);

    res.json(estimate);
  } catch (err) {
    console.error('Update estimate error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /:id — delete estimate
router.delete('/:id', (req, res) => {
  try {
    const db = getDB();
    const result = db.prepare('DELETE FROM estimates WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    res.json({ message: 'Estimate deleted' });
  } catch (err) {
    console.error('Delete estimate error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
