import express from 'express';
import { promisePool } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all guests
router.get('/', authenticate, async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = 'SELECT * FROM guests WHERE 1=1';
    const params = [];
    
    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [guests] = await promisePool.query(query, params);
    
    res.json({
      success: true,
      data: guests
    });
  } catch (error) {
    console.error('Get guests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching guests' 
    });
  }
});

// Get single guest
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [guests] = await promisePool.query(
      'SELECT * FROM guests WHERE id = ?',
      [id]
    );
    
    if (guests.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Guest not found' 
      });
    }
    
    // Get guest bookings
    const [bookings] = await promisePool.query(
      `SELECT 
        b.*,
        r.room_number,
        r.room_type
      FROM bookings b
      INNER JOIN rooms r ON b.room_id = r.id
      WHERE b.guest_id = ?
      ORDER BY b.created_at DESC`,
      [id]
    );
    
    res.json({
      success: true,
      data: {
        ...guests[0],
        bookings
      }
    });
  } catch (error) {
    console.error('Get guest error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching guest' 
    });
  }
});

// Create new guest (public - for booking form)
router.post('/', async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      nationality,
      id_type,
      id_number
    } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'First name, last name, and email are required' 
      });
    }

    // Check if email already exists
    const [existing] = await promisePool.query(
      'SELECT id FROM guests WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Guest with this email already exists' 
      });
    }

    const [result] = await promisePool.query(
      `INSERT INTO guests 
       (first_name, last_name, email, phone, address, nationality, id_type, id_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        email,
        phone || null,
        address || null,
        nationality || null,
        id_type || null,
        id_number || null
      ]
    );

    // Create notification
    await promisePool.query(
      `INSERT INTO notifications (type, title, message)
       VALUES (?, ?, ?)`,
      [
        'guest',
        'New Guest Registration',
        `New guest ${first_name} ${last_name} has registered`
      ]
    );

    const [newGuest] = await promisePool.query(
      'SELECT * FROM guests WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Guest created successfully',
      data: newGuest[0]
    });
  } catch (error) {
    console.error('Create guest error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating guest' 
    });
  }
});

// Update guest
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      nationality,
      id_type,
      id_number
    } = req.body;

    // Check if guest exists
    const [existing] = await promisePool.query(
      'SELECT id FROM guests WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Guest not found' 
      });
    }

    // Check if email is being changed and already exists
    if (email) {
      const [emailCheck] = await promisePool.query(
        'SELECT id FROM guests WHERE email = ? AND id != ?',
        [email, id]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already in use' 
        });
      }
    }

    await promisePool.query(
      `UPDATE guests SET
       first_name = ?,
       last_name = ?,
       email = ?,
       phone = ?,
       address = ?,
       nationality = ?,
       id_type = ?,
       id_number = ?
       WHERE id = ?`,
      [
        first_name,
        last_name,
        email,
        phone,
        address,
        nationality,
        id_type,
        id_number,
        id
      ]
    );

    const [updated] = await promisePool.query(
      'SELECT * FROM guests WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Guest updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Update guest error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating guest' 
    });
  }
});

// Delete guest
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await promisePool.query(
      'DELETE FROM guests WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Guest not found' 
      });
    }

    res.json({
      success: true,
      message: 'Guest deleted successfully'
    });
  } catch (error) {
    console.error('Delete guest error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting guest' 
    });
  }
});

export default router;

