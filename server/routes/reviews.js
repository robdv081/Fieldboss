const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

// GET / — list reviews
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const { search } = req.query;

    let query = `SELECT r.*, c.name as customer_name
                 FROM reviews r
                 LEFT JOIN customers c ON r.customer_id = c.id
                 WHERE r.user_id = ?`;
    const params = [req.userId];

    if (search) {
      query += ' AND (r.review_text LIKE ? OR r.platform LIKE ? OR c.name LIKE ? OR r.response_text LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY r.review_date DESC';
    const reviews = db.prepare(query).all(...params);
    res.json(reviews);
  } catch (err) {
    console.error('List reviews error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST / — create review
router.post('/', (req, res) => {
  try {
    const db = getDB();
    const { customer_id, job_id, rating, review_text, platform, review_date, responded, response_text } = req.body;

    const result = db.prepare(
      `INSERT INTO reviews (user_id, customer_id, job_id, rating, review_text, platform, review_date, responded, response_text)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      req.userId, customer_id || null, job_id || null, rating || null,
      review_text || null, platform || null, review_date || null,
      responded || 0, response_text || null
    );

    const review = db.prepare(
      `SELECT r.*, c.name as customer_name
       FROM reviews r
       LEFT JOIN customers c ON r.customer_id = c.id
       WHERE r.id = ?`
    ).get(result.lastInsertRowid);

    res.status(201).json(review);
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /:id — update review
router.put('/:id', (req, res) => {
  try {
    const db = getDB();

    const existing = db.prepare('SELECT id FROM reviews WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const { customer_id, job_id, rating, review_text, platform, review_date, responded, response_text } = req.body;

    db.prepare(
      `UPDATE reviews SET customer_id = ?, job_id = ?, rating = ?, review_text = ?, platform = ?, review_date = ?, responded = ?, response_text = ?
       WHERE id = ? AND user_id = ?`
    ).run(
      customer_id || null, job_id || null, rating || null,
      review_text || null, platform || null, review_date || null,
      responded || 0, response_text || null,
      req.params.id, req.userId
    );

    const review = db.prepare(
      `SELECT r.*, c.name as customer_name
       FROM reviews r
       LEFT JOIN customers c ON r.customer_id = c.id
       WHERE r.id = ?`
    ).get(req.params.id);

    res.json(review);
  } catch (err) {
    console.error('Update review error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /:id — delete review
router.delete('/:id', (req, res) => {
  try {
    const db = getDB();
    const result = db.prepare('DELETE FROM reviews WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
