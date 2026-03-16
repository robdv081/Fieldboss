require('dotenv').config();
const express = require('express');
const path = require('path');
const { initDB } = require('./db');
const { authenticate } = require('./middleware');
const { corsMiddleware } = require('./middleware');

// Import routes
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const jobRoutes = require('./routes/jobs');
const estimateRoutes = require('./routes/estimates');
const invoiceRoutes = require('./routes/invoices');
const crewRoutes = require('./routes/crew');
const reviewRoutes = require('./routes/reviews');
const dashboardRoutes = require('./routes/dashboard');

// Initialize database
initDB();

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', authenticate, customerRoutes);
app.use('/api/jobs', authenticate, jobRoutes);
app.use('/api/estimates', authenticate, estimateRoutes);
app.use('/api/invoices', authenticate, invoiceRoutes);
app.use('/api/crew', authenticate, crewRoutes);
app.use('/api/reviews', authenticate, reviewRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);

// Serve static files in production
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

// SPA catch-all — serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FieldBoss server running on port ${PORT}`);
});
