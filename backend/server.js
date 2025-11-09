import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/database.js';
import bookingRoutes from './routes/bookings.js';
import guestRoutes from './routes/guests.js';
import roomRoutes from './routes/rooms.js';
import roomAvailabilityRoutes from './routes/roomAvailability.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import checkDatabaseRoutes from './routes/checkDatabase.js';
import telegramRoutes from './routes/telegram.js';
import visitorRoutes from './routes/visitors.js';
import activityRoutes from './routes/activities.js';
import offerRoutes from './routes/offers.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    return;
  }
  console.log('✅ Connected to MySQL database');
  connection.release();
});

// Routes
app.use('/api/auth', authRoutes);
// Also mount user routes under /api/user (for backward compatibility)
app.use('/api/user', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/room-availability', roomAvailabilityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/visitor', visitorRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/offers', offerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Database check endpoint
app.use('/api/check', checkDatabaseRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    details: process.env.NODE_ENV === 'development' ? {
      code: err.code,
      sqlMessage: err.sqlMessage,
      path: req.path,
      method: req.method
    } : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

