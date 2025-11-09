import express from 'express';
import { promisePool } from '../config/database.js';

const router = express.Router();

// Check if database and tables exist
router.get('/check', async (req, res) => {
  try {
    // Check if admins table exists
    const [tables] = await promisePool.query(
      "SHOW TABLES LIKE 'admins'"
    );

    if (tables.length === 0) {
      return res.json({
        success: false,
        message: 'Database tables not initialized',
        needsInit: true,
        tables: {
          admins: false,
          guests: false,
          rooms: false,
          bookings: false,
          notifications: false
        }
      });
    }

    // Check all tables
    const [allTables] = await promisePool.query('SHOW TABLES');
    const tableNames = allTables.map(row => Object.values(row)[0]);

    // Check if admin user exists
    const [admins] = await promisePool.query('SELECT COUNT(*) as count FROM admins');
    const adminCount = admins[0].count;

    res.json({
      success: true,
      message: 'Database is initialized',
      needsInit: false,
      tables: {
        admins: tableNames.includes('admins'),
        guests: tableNames.includes('guests'),
        rooms: tableNames.includes('rooms'),
        bookings: tableNames.includes('bookings'),
        notifications: tableNames.includes('notifications'),
        all: tableNames
      },
      adminCount: adminCount,
      ready: adminCount > 0
    });
  } catch (error) {
    console.error('Database check error:', error);
    res.status(500).json({
      success: false,
      message: 'Database check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        sqlMessage: error.sqlMessage
      } : undefined
    });
  }
});

export default router;

