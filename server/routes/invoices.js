const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

// GET / — list invoices
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const { search, status } = req.query;

    let query = `SELECT i.*, c.name as customer_name
                 FROM invoices i
                 LEFT JOIN customers c ON i.customer_id = c.id
                 WHERE i.user_id = ?`;
    const params = [req.userId];

    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (i.title LIKE ? OR i.notes LIKE ? OR c.name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY i.created_at DESC';
    const invoices = db.prepare(query).all(...params);
    res.json(invoices);
  } catch (err) {
    console.error('List invoices error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST / — create invoice
router.post('/', (req, res) => {
  try {
    const db = getDB();
    const { customer_id, job_id, estimate_id, title, items, subtotal, tax_rate, tax, total, status, due_date, paid_date, notes } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const itemsJson = items ? (typeof items === 'string' ? items : JSON.stringify(items)) : null;

    const result = db.prepare(
      `INSERT INTO invoices (user_id, customer_id, job_id, estimate_id, title, items, subtotal, tax_rate, tax, total, status, due_date, paid_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      req.userId, customer_id || null, job_id || null, estimate_id || null, title, itemsJson,
      subtotal || 0, tax_rate || 0, tax || 0, total || 0,
      status || 'draft', due_date || null, paid_date || null, notes || null
    );

    const invoice = db.prepare(
      `SELECT i.*, c.name as customer_name
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE i.id = ?`
    ).get(result.lastInsertRowid);

    res.status(201).json(invoice);
  } catch (err) {
    console.error('Create invoice error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /:id — update invoice
router.put('/:id', (req, res) => {
  try {
    const db = getDB();

    const existing = db.prepare('SELECT id FROM invoices WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const { customer_id, job_id, estimate_id, title, items, subtotal, tax_rate, tax, total, status, due_date, paid_date, notes } = req.body;

    const itemsJson = items ? (typeof items === 'string' ? items : JSON.stringify(items)) : null;

    db.prepare(
      `UPDATE invoices SET customer_id = ?, job_id = ?, estimate_id = ?, title = ?, items = ?, subtotal = ?, tax_rate = ?, tax = ?, total = ?, status = ?, due_date = ?, paid_date = ?, notes = ?
       WHERE id = ? AND user_id = ?`
    ).run(
      customer_id || null, job_id || null, estimate_id || null, title, itemsJson,
      subtotal || 0, tax_rate || 0, tax || 0, total || 0,
      status || 'draft', due_date || null, paid_date || null, notes || null,
      req.params.id, req.userId
    );

    const invoice = db.prepare(
      `SELECT i.*, c.name as customer_name
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE i.id = ?`
    ).get(req.params.id);

    res.json(invoice);
  } catch (err) {
    console.error('Update invoice error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /:id — delete invoice
router.delete('/:id', (req, res) => {
  try {
    const db = getDB();
    const result = db.prepare('DELETE FROM invoices WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    console.error('Delete invoice error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
