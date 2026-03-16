const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

// GET / — list crew
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const { search } = req.query;

    let query = 'SELECT * FROM crew WHERE user_id = ?';
    const params = [req.userId];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR role LIKE ? OR trade LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    query += ' ORDER BY created_at DESC';
    const crew = db.prepare(query).all(...params);
    res.json(crew);
  } catch (err) {
    console.error('List crew error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST / — create crew member
router.post('/', (req, res) => {
  try {
    const db = getDB();
    const { name, phone, email, role, trade, hourly_rate, status, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = db.prepare(
      `INSERT INTO crew (user_id, name, phone, email, role, trade, hourly_rate, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(req.userId, name, phone || null, email || null, role || null, trade || null, hourly_rate || null, status || 'active', notes || null);

    const member = db.prepare('SELECT * FROM crew WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(member);
  } catch (err) {
    console.error('Create crew error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /:id — update crew member
router.put('/:id', (req, res) => {
  try {
    const db = getDB();

    const existing = db.prepare('SELECT id FROM crew WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Crew member not found' });
    }

    const { name, phone, email, role, trade, hourly_rate, status, notes } = req.body;

    db.prepare(
      `UPDATE crew SET name = ?, phone = ?, email = ?, role = ?, trade = ?, hourly_rate = ?, status = ?, notes = ?
       WHERE id = ? AND user_id = ?`
    ).run(name, phone || null, email || null, role || null, trade || null, hourly_rate || null, status || 'active', notes || null, req.params.id, req.userId);

    const member = db.prepare('SELECT * FROM crew WHERE id = ?').get(req.params.id);
    res.json(member);
  } catch (err) {
    console.error('Update crew error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /:id — delete crew member
router.delete('/:id', (req, res) => {
  try {
    const db = getDB();
    const result = db.prepare('DELETE FROM crew WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Crew member not found' });
    }

    res.json({ message: 'Crew member deleted' });
  } catch (err) {
    console.error('Delete crew error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
