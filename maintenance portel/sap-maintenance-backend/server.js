/**
 * SAP Maintenance Portal - Backend Entry Point
 * Express.js Server with MVC Architecture
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const workOrderRoutes = require('./src/routes/workOrderRoutes');
const plantRoutes = require('./src/routes/plantRoutes');

// Import Error Handler
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(helmet({ contentSecurityPolicy: false }));

// ============================================
// CORS CONFIGURATION
// ============================================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-employee-id'],
  credentials: false,
}));

// ============================================
// RATE LIMITING
// ============================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ============================================
// BODY PARSING & LOGGING
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('[:date[clf]] :method :url :status :response-time ms'));

// ============================================
// HEALTH CHECK
// ============================================
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: 'SAP Maintenance Portal API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      login: 'POST /api/auth/login',
      dashboard: 'GET /api/dashboard',
      notifications: 'GET /api/notifications',
      workOrders: 'GET /api/workorders',
      plants: 'GET /api/plants',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

// ============================================
// API ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/workorders', workOrderRoutes);
app.use('/api/plants', plantRoutes);

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log(`║  SAP Maintenance Portal Backend            ║`);
  console.log(`║  Server running on http://localhost:${PORT}   ║`);
  console.log(`║  SAP OData: ${process.env.SAP_BASE_URL ? '✓ Configured' : '✗ Missing'}              ║`);
  console.log('╚════════════════════════════════════════════╝\n');
});

module.exports = app;
