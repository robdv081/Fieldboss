const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

// GET / — dashboard stats
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const userId = req.userId;

    const stats = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM customers WHERE user_id = ?) as total_customers,
        (SELECT COUNT(*) FROM jobs WHERE user_id = ?) as total_jobs,
        (SELECT COUNT(*) FROM jobs WHERE user_id = ? AND status = 'pending') as pending_jobs,
        (SELECT COUNT(*) FROM jobs WHERE user_id = ? AND status = 'scheduled') as scheduled_jobs,
        (SELECT COUNT(*) FROM jobs WHERE user_id = ? AND status = 'in_progress') as in_progress_jobs,
        (SELECT COUNT(*) FROM jobs WHERE user_id = ? AND status = 'completed') as completed_jobs,
        (SELECT COUNT(*) FROM estimates WHERE user_id = ?) as total_estimates,
        (SELECT COUNT(*) FROM estimates WHERE user_id = ? AND status = 'sent') as pending_estimates,
        (SELECT COUNT(*) FROM estimates WHERE user_id = ? AND status = 'accepted') as accepted_estimates,
        (SELECT COALESCE(SUM(total), 0) FROM estimates WHERE user_id = ? AND status = 'accepted') as estimates_value,
        (SELECT COUNT(*) FROM invoices WHERE user_id = ?) as total_invoices,
        (SELECT COUNT(*) FROM invoices WHERE user_id = ? AND status = 'sent') as unpaid_invoices,
        (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE user_id = ? AND status = 'sent') as unpaid_amount,
        (SELECT COUNT(*) FROM invoices WHERE user_id = ? AND status = 'paid') as paid_invoices,
        (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE user_id = ? AND status = 'paid') as revenue,
        (SELECT COUNT(*) FROM invoices WHERE user_id = ? AND status = 'overdue') as overdue_invoices,
        (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE user_id = ? AND status = 'overdue') as overdue_amount,
        (SELECT COUNT(*) FROM crew WHERE user_id = ? AND status = 'active') as active_crew,
        (SELECT COUNT(*) FROM reviews WHERE user_id = ?) as total_reviews,
        (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE user_id = ?) as avg_rating
    `).get(
      userId, userId, userId, userId, userId, userId,
      userId, userId, userId, userId,
      userId, userId, userId, userId, userId, userId, userId,
      userId, userId, userId
    );

    // Today's jobs
    const today = new Date().toISOString().split('T')[0];
    const todaysJobs = db.prepare(`
      SELECT j.*, c.name as customer_name
      FROM jobs j
      LEFT JOIN customers c ON j.customer_id = c.id
      WHERE j.user_id = ? AND j.scheduled_date = ?
      ORDER BY j.scheduled_time ASC
    `).all(userId, today);

    res.json({
      stats,
      todaysJobs
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
