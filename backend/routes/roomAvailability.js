import express from 'express';
import { promisePool } from '../config/database.js';

const router = express.Router();

// Search available rooms by date range and guest count
router.post('/search', async (req, res) => {
  try {
    const { check_in_date, check_out_date, number_of_guests, room_type } = req.body;

    if (!check_in_date || !check_out_date || !number_of_guests) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: check_in_date, check_out_date, number_of_guests'
      });
    }

    // Get all rooms
    let roomsQuery = 'SELECT * FROM rooms WHERE status = "available"';
    const roomsParams = [];

    if (room_type && room_type !== 'all') {
      roomsQuery += ' AND type = ?';
      roomsParams.push(room_type);
    }

    roomsQuery += ' ORDER BY price ASC';

    const [rooms] = await promisePool.query(roomsQuery, roomsParams);

    // Check availability for each room
    const availableRooms = [];

    for (const room of rooms) {
      // Check if room has enough capacity
      if (room.capacity < number_of_guests) {
        continue;
      }

      // Check for conflicting bookings
      const [conflicts] = await promisePool.query(
        `SELECT id FROM bookings 
         WHERE room_id = ? 
         AND status NOT IN ('cancelled', 'checked_out')
         AND (
           (check_in_date <= ? AND check_out_date >= ?) OR
           (check_in_date <= ? AND check_out_date >= ?) OR
           (check_in_date >= ? AND check_out_date <= ?)
         )`,
        [
          room.id,
          check_in_date, check_in_date,
          check_out_date, check_out_date,
          check_in_date, check_out_date
        ]
      );

      if (conflicts.length === 0) {
        // Calculate available beds (capacity - occupied beds)
        const [occupiedBookings] = await promisePool.query(
          `SELECT SUM(number_of_guests) as total_occupied 
           FROM bookings 
           WHERE room_id = ? 
           AND status NOT IN ('cancelled', 'checked_out')
           AND (
             (check_in_date <= ? AND check_out_date >= ?) OR
             (check_in_date <= ? AND check_out_date >= ?) OR
             (check_in_date >= ? AND check_out_date <= ?)
           )`,
          [
            room.id,
            check_in_date, check_in_date,
            check_out_date, check_out_date,
            check_in_date, check_out_date
          ]
        );

        const totalOccupied = occupiedBookings[0]?.total_occupied || 0;
        const availableBeds = room.capacity - totalOccupied;

        if (availableBeds >= number_of_guests) {
          // Calculate total price
          const checkIn = new Date(check_in_date);
          const checkOut = new Date(check_out_date);
          const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
          const totalPrice = (room.price || 0) * nights;

          availableRooms.push({
            ...room,
            available_beds: availableBeds,
            total_price: totalPrice,
            price_per_night: room.price || 0,
            is_available: true,
            can_accommodate: true
          });
        }
      }
    }

    res.json({
      success: true,
      data: availableRooms,
      count: availableRooms.length
    });
  } catch (error) {
    console.error('Room availability search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching room availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

