const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

// GET / — list jobs
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const { search, status } = req.query;

    let query = `SELECT j.*, c.name as customer_name
                 FROM jobs j
                 LEFT JOIN customers c ON j.customer_id = c.id
                 WHERE j.user_id = ?`;
    const params = [req.userId];

    if (status) {
      query += ' AND j.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (j.title LIKE ? OR j.description LIKE ? OR j.address LIKE ? OR c.name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY j.created_at DESC';
    const jobs = db.prepare(query).all(...params);
    res.json(jobs);
  } catch (err) {
    console.error('List jobs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /:id — get single job
router.get('/:id', (req, res) => {
  try {
    const db = getDB();
    const job = db.prepare(
      `SELECT j.*, c.name as customer_name
       FROM jobs j
       LEFT JOIN customers c ON j.customer_id = c.id
       WHERE j.id = ? AND j.user_id = ?`
    ).get(req.params.id, req.userId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (err) {
    console.error('Get job error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST / — create job
router.post('/', (req, res) => {
  try {
    const db = getDB();
    const {
      customer_id, title, description, trade, status,
      scheduled_date, scheduled_time, estimated_duration,
      address, assigned_crew, estimated_cost, actual_cost, notes
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const crewJson = assigned_crew ? (typeof assigned_crew === 'string' ? assigned_crew : JSON.stringify(assigned_crew)) : null;

    const result = db.prepare(
      `INSERT INTO jobs (user_id, customer_id, title, description, trade, status, scheduled_date, scheduled_time, estimated_duration, address, assigned_crew, estimated_cost, actual_cost, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      req.userId, customer_id || null, title, description || null, trade || null,
      status || 'pending', scheduled_date || null, scheduled_time || null,
      estimated_duration || null, address || null, crewJson,
      estimated_cost || null, actual_cost || null, notes || null
    );

    const job = db.prepare(
      `SELECT j.*, c.name as customer_name
       FROM jobs j
       LEFT JOIN customers c ON j.customer_id = c.id
       WHERE j.id = ?`
    ).get(result.lastInsertRowid);

    res.status(201).json(job);
  } catch (err) {
    console.error('Create job error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /:id — update job
router.put('/:id', (req, res) => {
  try {
    const db = getDB();

    const existing = db.prepare('SELECT id FROM jobs WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const {
      customer_id, title, description, trade, status,
      scheduled_date, scheduled_time, estimated_duration,
      address, assigned_crew, estimated_cost, actual_cost, notes
    } = req.body;

    const crewJson = assigned_crew ? (typeof assigned_crew === 'string' ? assigned_crew : JSON.stringify(assigned_crew)) : null;

    db.prepare(
      `UPDATE jobs SET customer_id = ?, title = ?, description = ?, trade = ?, status = ?,
       scheduled_date = ?, scheduled_time = ?, estimated_duration = ?, address = ?,
       assigned_crew = ?, estimated_cost = ?, actual_cost = ?, notes = ?, updated_at = datetime('now')
       WHERE id = ? AND user_id = ?`
    ).run(
      customer_id || null, title, description || null, trade || null, status || 'pending',
      scheduled_date || null, scheduled_time || null, estimated_duration || null,
      address || null, crewJson, estimated_cost || null, actual_cost || null,
      notes || null, req.params.id, req.userId
    );

    const job = db.prepare(
      `SELECT j.*, c.name as customer_name
       FROM jobs j
       LEFT JOIN customers c ON j.customer_id = c.id
       WHERE j.id = ?`
    ).get(req.params.id);

    res.json(job);
  } catch (err) {
    console.error('Update job error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /:id — delete job
router.delete('/:id', (req, res) => {
  try {
    const db = getDB();
    const result = db.prepare('DELETE FROM jobs WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error('Delete job error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /:id/status — quick status update
router.patch('/:id/status', (req, res) => {
  try {
    const db = getDB();
    const { status } = req.body;

    const validStatuses = ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
    }

    const result = db.prepare(
      "UPDATE jobs SET status = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
    ).run(status, req.params.id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = db.prepare(
      `SELECT j.*, c.name as customer_name
       FROM jobs j
       LEFT JOIN customers c ON j.customer_id = c.id
       WHERE j.id = ?`
    ).get(req.params.id);

    res.json(job);
  } catch (err) {
    console.error('Update job status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
