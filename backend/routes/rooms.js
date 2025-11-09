import express from 'express';
import { promisePool } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get public rooms (available rooms for public viewing)
router.get('/public', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    // Get available rooms with limit
    const [rooms] = await promisePool.query(
      `SELECT 
        id,
        room_number,
        name,
        type,
        capacity,
        floor,
        price,
        status,
        description,
        image_url,
        amenities,
        created_at
      FROM rooms 
      WHERE status = 'available' 
      ORDER BY price ASC, created_at DESC 
      LIMIT ?`,
      [parseInt(limit)]
    );

    // Parse amenities if they're JSON strings
    const formattedRooms = rooms.map(room => ({
      ...room,
      amenities: typeof room.amenities === 'string' 
        ? (room.amenities.startsWith('[') || room.amenities.startsWith('{') 
            ? JSON.parse(room.amenities) 
            : room.amenities.split(',').map(a => a.trim()))
        : room.amenities
    }));

    res.json({
      success: true,
      data: formattedRooms,
      count: formattedRooms.length
    });
  } catch (error) {
    console.error('Get public rooms error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching rooms' 
    });
  }
});

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const { status, room_type, type, available_from, available_to } = req.query;
    
    let query = 'SELECT * FROM rooms WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (room_type || type) {
      query += ' AND type = ?';
      params.push(room_type || type);
    }
    
    query += ' ORDER BY room_number';
    
    const [rooms] = await promisePool.query(query, params);
    
    // If checking availability, filter out rooms with conflicting bookings
    if (available_from && available_to) {
      const availableRooms = [];
      
      for (const room of rooms) {
        const [conflicts] = await promisePool.query(
          `SELECT id FROM bookings 
           WHERE room_id = ? 
           AND status NOT IN ('cancelled', 'checked_out')
           AND (
             (check_in_date <= ? AND check_out_date >= ?) OR
             (check_in_date <= ? AND check_out_date >= ?) OR
             (check_in_date >= ? AND check_out_date <= ?)
           )`,
          [room.id, available_from, available_from, available_to, available_to, available_from, available_to]
        );
        
        if (conflicts.length === 0 && room.status === 'available') {
          availableRooms.push(room);
        }
      }
      
      return res.json({
        success: true,
        data: availableRooms
      });
    }
    
    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching rooms' 
    });
  }
});

// Get single room
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rooms] = await promisePool.query(
      'SELECT * FROM rooms WHERE id = ?',
      [id]
    );
    
    if (rooms.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Room not found' 
      });
    }
    
    // Get room bookings
    const [bookings] = await promisePool.query(
      `SELECT 
        b.*,
        g.first_name,
        g.last_name,
        g.email
      FROM bookings b
      INNER JOIN guests g ON b.guest_id = g.id
      WHERE b.room_id = ?
      ORDER BY b.check_in_date DESC`,
      [id]
    );
    
    res.json({
      success: true,
      data: {
        ...rooms[0],
        bookings
      }
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching room' 
    });
  }
});

// Create new room
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      room_number,
      name,
      room_type,
      type,
      price_per_night,
      price,
      capacity,
      amenities,
      status,
      description,
      image_url
    } = req.body;

    if (!room_number || (!room_type && !type) || (!price_per_night && !price) || !capacity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: room_number, type/room_type, price/price_per_night, capacity' 
      });
    }

    // Check if room number already exists
    const [existing] = await promisePool.query(
      'SELECT id FROM rooms WHERE room_number = ?',
      [room_number]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Room number already exists' 
      });
    }

    const roomType = type || room_type || 'standard';
    const roomPrice = price || price_per_night || 0;
    const roomName = name || room_number;

    const [result] = await promisePool.query(
      `INSERT INTO rooms 
       (room_number, name, type, price, capacity, amenities, status, description, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        room_number,
        roomName,
        roomType,
        roomPrice,
        capacity,
        Array.isArray(amenities) ? JSON.stringify(amenities) : amenities,
        status || 'available',
        description || null,
        image_url || null
      ]
    );

    const [newRoom] = await promisePool.query(
      'SELECT * FROM rooms WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: newRoom[0]
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating room' 
    });
  }
});

// Update room
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      room_number,
      name,
      room_type,
      type,
      price_per_night,
      price,
      capacity,
      amenities,
      status,
      description,
      image_url
    } = req.body;

    // Check if room exists
    const [existing] = await promisePool.query(
      'SELECT id FROM rooms WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Room not found' 
      });
    }

    // Check if room number is being changed and already exists
    if (room_number) {
      const [roomCheck] = await promisePool.query(
        'SELECT id FROM rooms WHERE room_number = ? AND id != ?',
        [room_number, id]
      );

      if (roomCheck.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Room number already in use' 
        });
      }
    }

    // Get current room data
    const [current] = await promisePool.query(
      'SELECT * FROM rooms WHERE id = ?',
      [id]
    );

    await promisePool.query(
      `UPDATE rooms SET
       room_number = ?,
       name = ?,
       type = ?,
       price = ?,
       capacity = ?,
       amenities = ?,
       status = ?,
       description = ?,
       image_url = ?
       WHERE id = ?`,
      [
        room_number !== undefined ? room_number : current[0].room_number,
        name !== undefined ? name : current[0].name,
        (type || room_type) !== undefined ? (type || room_type) : current[0].type,
        (price || price_per_night) !== undefined ? (price || price_per_night) : current[0].price,
        capacity !== undefined ? capacity : current[0].capacity,
        amenities !== undefined ? (Array.isArray(amenities) ? JSON.stringify(amenities) : amenities) : current[0].amenities,
        status !== undefined ? status : current[0].status,
        description !== undefined ? description : current[0].description,
        image_url !== undefined ? image_url : current[0].image_url,
        id
      ]
    );

    const [updated] = await promisePool.query(
      'SELECT * FROM rooms WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating room' 
    });
  }
});

// Delete room
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if room has active bookings
    const [bookings] = await promisePool.query(
      `SELECT id FROM bookings 
       WHERE room_id = ? 
       AND status NOT IN ('cancelled', 'checked_out')`,
      [id]
    );

    if (bookings.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete room with active bookings' 
      });
    }

    const [result] = await promisePool.query(
      'DELETE FROM rooms WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Room not found' 
      });
    }

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting room' 
    });
  }
});

export default router;

