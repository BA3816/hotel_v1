import express from 'express';
import { promisePool } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    // Total bookings
    const [totalBookings] = await promisePool.query(
      'SELECT COUNT(*) as count FROM bookings'
    );

    // Pending bookings
    const [pendingBookings] = await promisePool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'"
    );

    // Confirmed bookings
    const [confirmedBookings] = await promisePool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'"
    );

    // Checked in bookings
    const [checkedInBookings] = await promisePool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE status = 'checked_in'"
    );

    // Total guests
    const [totalGuests] = await promisePool.query(
      'SELECT COUNT(*) as count FROM guests'
    );

    // Total rooms
    const [totalRooms] = await promisePool.query(
      'SELECT COUNT(*) as count FROM rooms'
    );

    // Available rooms
    const [availableRooms] = await promisePool.query(
      "SELECT COUNT(*) as count FROM rooms WHERE status = 'available'"
    );

    // Total revenue (from completed bookings)
    const [revenue] = await promisePool.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM bookings WHERE status IN ('confirmed', 'checked_in', 'checked_out')"
    );

    // Recent bookings
    const [recentBookings] = await promisePool.query(
      `SELECT 
        b.*,
        g.first_name,
        g.last_name,
        g.email,
        r.room_number,
        r.name as room_name,
        r.type as room_type
      FROM bookings b
      INNER JOIN guests g ON b.guest_id = g.id
      INNER JOIN rooms r ON b.room_id = r.id
      ORDER BY b.created_at DESC
      LIMIT 10`
    );

    // Upcoming check-ins (next 7 days)
    const [upcomingCheckIns] = await promisePool.query(
      `SELECT 
        b.*,
        g.first_name,
        g.last_name,
        g.email,
        r.room_number,
        r.name as room_name,
        r.type as room_type
      FROM bookings b
      INNER JOIN guests g ON b.guest_id = g.id
      INNER JOIN rooms r ON b.room_id = r.id
      WHERE b.check_in_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      AND b.status IN ('confirmed', 'pending')
      ORDER BY b.check_in_date ASC`
    );

    // Unread notifications count
    const [unreadNotifications] = await promisePool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE is_read = FALSE'
    );

    res.json({
      success: true,
      data: {
        bookings: {
          total: totalBookings[0].count,
          pending: pendingBookings[0].count,
          confirmed: confirmedBookings[0].count,
          checkedIn: checkedInBookings[0].count
        },
        guests: {
          total: totalGuests[0].count
        },
        rooms: {
          total: totalRooms[0].count,
          available: availableRooms[0].count
        },
        revenue: parseFloat(revenue[0].total),
        recentBookings: recentBookings,
        upcomingCheckIns: upcomingCheckIns,
        unreadNotifications: unreadNotifications[0].count
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard statistics' 
    });
  }
});

// Get notifications
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const { unread_only } = req.query;
    
    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];
    
    if (unread_only === 'true') {
      query += ' AND is_read = FALSE';
    }
    
    query += ' ORDER BY created_at DESC LIMIT 50';
    
    const [notifications] = await promisePool.query(query, params);
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching notifications' 
    });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    await promisePool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating notification' 
    });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', authenticate, async (req, res) => {
  try {
    await promisePool.query(
      'UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE'
    );
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating notifications' 
    });
  }
});

export default router;

