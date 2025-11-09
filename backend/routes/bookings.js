import express from 'express';
import { promisePool } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import telegramService from '../services/telegramService.js';

const router = express.Router();

// Get all bookings
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, start_date, end_date } = req.query;
    
    // First, check what columns actually exist in the bookings table
    // Use LEFT JOIN to handle cases where guest or room might be deleted
    let query = `
      SELECT 
        b.id,
        b.guest_id,
        b.room_id,
        b.check_in,
        b.check_out,
        COALESCE(b.adults, 1) as adults,
        COALESCE(b.children, 0) as children,
        COALESCE(b.total_price, 0) as total_price,
        COALESCE(b.status, 'pending') as status,
        COALESCE(b.payment_status, 'pending') as payment_status,
        b.special_requests,
        b.created_at,
        b.updated_at,
        COALESCE(g.id, 0) as guest_id_full,
        COALESCE(g.first_name, '') as first_name,
        COALESCE(g.last_name, '') as last_name,
        COALESCE(g.email, '') as email,
        COALESCE(g.phone, '') as phone,
        COALESCE(r.id, 0) as room_id_full,
        COALESCE(r.room_number, '') as room_number,
        COALESCE(r.room_type, '') as room_type,
        COALESCE(r.price_per_night, 0) as price_per_night
      FROM bookings b
      LEFT JOIN guests g ON b.guest_id = g.id
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }
    
    if (start_date) {
      query += ' AND b.check_in >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND b.check_out <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY b.created_at DESC';
    
    let bookings = [];
    try {
      const result = await promisePool.query(query, params);
      bookings = Array.isArray(result[0]) ? result[0] : [];
    } catch (queryError) {
      console.error('SQL Query Error:', queryError);
      console.error('Query was:', query);
      console.error('Params were:', params);
      throw queryError;
    }
    
    // Format bookings with nested objects - map to expected format
    const formattedBookings = (bookings || []).map(booking => {
      const adults = parseInt(booking.adults) || 0;
      const children = parseInt(booking.children) || 0;
      const totalGuests = adults + children || 1;
      
      return {
        id: booking.id,
        booking_reference: `BK${booking.id}`, // Generate if not in DB
        guest_id: booking.guest_id || 0,
        room_id: booking.room_id || 0,
        check_in_date: booking.check_in ? new Date(booking.check_in).toISOString().split('T')[0] : null,
        check_out_date: booking.check_out ? new Date(booking.check_out).toISOString().split('T')[0] : null,
        number_of_guests: totalGuests,
        total_amount: parseFloat(booking.total_price) || 0,
        original_amount: parseFloat(booking.total_price) || 0,
        discount_amount: 0, // Not in schema
        status: booking.status || 'pending',
        payment_status: booking.payment_status || 'pending',
        special_requests: booking.special_requests || null,
        offer_id: null, // Not in schema
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        guest: {
          id: booking.guest_id_full || 0,
          first_name: booking.first_name || '',
          last_name: booking.last_name || '',
          email: booking.email || '',
          phone: booking.phone || ''
        },
        room: {
          id: booking.room_id_full || 0,
          room_number: booking.room_number || '',
          name: booking.room_type || '', // Use room_type as name
          type: booking.room_type || '',
          price: parseFloat(booking.price_per_night) || 0
        }
      };
    });
    
    res.json({
      success: true,
      data: formattedBookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      sql: error.sql,
      code: error.code,
      sqlMessage: error.sqlMessage
    });
    
    // Try a simpler fallback query
    try {
      console.log('Attempting fallback query...');
      const [simpleBookings] = await promisePool.query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 100');
      const fallbackData = Array.isArray(simpleBookings) ? simpleBookings.map(b => ({
        id: b.id,
        booking_reference: `BK${b.id}`,
        guest_id: b.guest_id || 0,
        room_id: b.room_id || 0,
        check_in_date: b.check_in || b.check_in_date || null,
        check_out_date: b.check_out || b.check_out_date || null,
        number_of_guests: (b.adults || 0) + (b.children || 0) || 1,
        total_amount: parseFloat(b.total_price || b.total_amount || 0),
        status: b.status || 'pending',
        payment_status: b.payment_status || 'pending',
        guest: { id: 0, first_name: '', last_name: '', email: '', phone: '' },
        room: { id: 0, room_number: '', name: '', type: '', price: 0 }
      })) : [];
      
      return res.json({
        success: true,
        data: fallbackData
      });
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      // Return empty array as last resort
      return res.json({
        success: true,
        data: []
      });
    }
  }
});

// Get single booking
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [bookings] = await promisePool.query(
      `SELECT 
        b.*,
        g.first_name,
        g.last_name,
        g.email,
        g.phone,
        g.address,
        g.nationality,
        r.room_number,
        r.name as room_name,
        r.type as room_type,
        r.price as price_per_night,
        r.amenities
      FROM bookings b
      INNER JOIN guests g ON b.guest_id = g.id
      INNER JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ?`,
      [id]
    );
    
    if (bookings.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }
    
    res.json({
      success: true,
      data: bookings[0]
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching booking' 
    });
  }
});

// Create new booking
router.post('/', async (req, res) => {
  try {
    let {
      guest_id,
      room_id,
      check_in,
      check_out,
      check_in_date,
      check_out_date,
      adults,
      children,
      number_of_guests,
      special_requests,
      // Guest info (if creating new guest)
      first_name,
      last_name,
      email,
      phone,
      nationality,
      date_of_birth,
      id_type,
      id_number,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      offer_id
    } = req.body;

    // Normalize date field names (support both formats)
    check_in = check_in || check_in_date;
    check_out = check_out || check_out_date;
    number_of_guests = number_of_guests || adults || 1;

    // Validate required fields
    if (!room_id || !check_in || !check_out) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: room_id, check_in_date, check_out_date' 
      });
    }

    // Create or find guest if guest_id not provided
    if (!guest_id) {
      if (!first_name || !last_name || !email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing guest information: first_name, last_name, email' 
        });
      }

      // Check if guest already exists
      const [existingGuest] = await promisePool.query(
        'SELECT id FROM guests WHERE email = ?',
        [email]
      );

      if (existingGuest.length > 0) {
        guest_id = existingGuest[0].id;
      } else {
        // Create new guest
        const [guestResult] = await promisePool.query(
          `INSERT INTO guests 
           (first_name, last_name, email, phone, nationality, date_of_birth, id_type, id_number, address, emergency_contact_name, emergency_contact_phone)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            first_name,
            last_name,
            email,
            phone || null,
            nationality || null,
            date_of_birth || null,
            id_type || null,
            id_number || null,
            address || null,
            emergency_contact_name || null,
            emergency_contact_phone || null
          ]
        );
        guest_id = guestResult.insertId;
      }
    }

    // Check if room is available
    const [rooms] = await promisePool.query(
      'SELECT * FROM rooms WHERE id = ?',
      [room_id]
    );

    if (rooms.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Room not found' 
      });
    }

    // Check for overlapping bookings (using correct column names)
    const [overlapping] = await promisePool.query(
      `SELECT id FROM bookings 
       WHERE room_id = ? 
       AND status NOT IN ('cancelled', 'checked_out')
       AND (
         (check_in_date <= ? AND check_out_date >= ?) OR
         (check_in_date <= ? AND check_out_date >= ?) OR
         (check_in_date >= ? AND check_out_date <= ?)
       )`,
      [room_id, check_in, check_in, check_out, check_out, check_in, check_out]
    );

    if (overlapping.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Room is not available for the selected dates' 
      });
    }

    // Calculate total price
    const room = rooms[0];
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const pricePerNight = room.price || 0;
    let originalAmount = pricePerNight * nights;
    let discountAmount = 0;
    let totalAmount = originalAmount;

    // Apply offer discount if provided
    if (offer_id) {
      const [offers] = await promisePool.query(
        'SELECT * FROM offers WHERE id = ? AND status = "active"',
        [offer_id]
      );
      if (offers.length > 0) {
        const offer = offers[0];
        if (offer.discount_type === 'percentage') {
          discountAmount = originalAmount * (offer.discount_value / 100);
          totalAmount = originalAmount - discountAmount;
        } else if (offer.discount_type === 'fixed_amount') {
          discountAmount = offer.discount_value;
          totalAmount = Math.max(0, originalAmount - discountAmount);
        }
      }
    }

    // Generate booking reference
    const bookingReference = `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create booking (using correct column names)
    const [result] = await promisePool.query(
      `INSERT INTO bookings 
       (guest_id, room_id, check_in_date, check_out_date, number_of_guests, total_amount, original_amount, discount_amount, special_requests, booking_reference, offer_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        guest_id,
        room_id,
        check_in,
        check_out,
        number_of_guests,
        totalAmount,
        originalAmount,
        discountAmount,
        special_requests || null,
        bookingReference,
        offer_id || null,
        'pending'
      ]
    );

    // Create notification for admins
    await promisePool.query(
      `INSERT INTO notifications (type, title, message)
       VALUES (?, ?, ?)`,
      [
        'booking',
        'New Booking Created',
        `New booking ${bookingReference} has been created for room ${room.room_number || room.name}`
      ]
    );

    // Get the created booking with details
    const [newBooking] = await promisePool.query(
      `SELECT 
        b.*,
        g.first_name,
        g.last_name,
        g.email,
        g.phone,
        r.room_number,
        r.name as room_name,
        r.type as room_type,
        r.price as room_price
      FROM bookings b
      INNER JOIN guests g ON b.guest_id = g.id
      INNER JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ?`,
      [result.insertId]
    );

    const bookingData = {
      ...newBooking[0],
      guest: {
        first_name: newBooking[0].first_name,
        last_name: newBooking[0].last_name,
        email: newBooking[0].email,
        phone: newBooking[0].phone
      },
      room: {
        room_number: newBooking[0].room_number,
        name: newBooking[0].room_name,
        type: newBooking[0].room_type,
        price: newBooking[0].room_price
      }
    };

    // Send Telegram notification (don't block if it fails)
    try {
      console.log('📱 Attempting to send Telegram notification...');
      const telegramResult = await telegramService.sendBookingNotification(bookingData);
      if (telegramResult.success) {
        console.log('✅ Telegram notification sent successfully');
      } else {
        console.log('ℹ️ Telegram notification skipped:', telegramResult.message);
      }
    } catch (telegramError) {
      console.error('❌ Telegram notification error:', telegramError.message);
      // Log full error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Telegram error details:', telegramError);
      }
      // Don't fail the booking creation if Telegram fails
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking: bookingData,
        guest: {
          id: guest_id,
          first_name,
          last_name,
          email
        }
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update booking
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      room_id,
      check_in,
      check_out,
      adults,
      children,
      status,
      payment_status,
      special_requests
    } = req.body;

    // Get existing booking
    const [existing] = await promisePool.query(
      'SELECT * FROM bookings WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    const booking = existing[0];
    const finalRoomId = room_id || booking.room_id;
    const finalCheckIn = check_in || booking.check_in_date || booking.check_in;
    const finalCheckOut = check_out || booking.check_out_date || booking.check_out;

    // If dates or room changed, check availability
    if ((check_in || check_out || room_id) && status !== 'cancelled') {
      const [overlapping] = await promisePool.query(
        `SELECT id FROM bookings 
         WHERE room_id = ? 
         AND id != ?
         AND status NOT IN ('cancelled', 'checked_out')
         AND (
           (COALESCE(check_in_date, check_in) <= ? AND COALESCE(check_out_date, check_out) >= ?) OR
           (COALESCE(check_in_date, check_in) <= ? AND COALESCE(check_out_date, check_out) >= ?) OR
           (COALESCE(check_in_date, check_in) >= ? AND COALESCE(check_out_date, check_out) <= ?)
         )`,
        [finalRoomId, id, finalCheckIn, finalCheckIn, finalCheckOut, finalCheckOut, finalCheckIn, finalCheckOut]
      );

      if (overlapping.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Room is not available for the selected dates' 
        });
      }
    }

    // Recalculate price if dates or room changed
    let totalPrice = booking.total_amount || booking.total_price;
    if (check_in || check_out || room_id) {
      const [rooms] = await promisePool.query(
        'SELECT COALESCE(price, price_per_night) as price FROM rooms WHERE id = ?',
        [finalRoomId]
      );
      
      if (rooms.length > 0) {
        const checkInDate = new Date(finalCheckIn);
        const checkOutDate = new Date(finalCheckOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        totalPrice = (rooms[0].price || 0) * nights;
      }
    }

    // Update booking - handle both column name variations
    const updateFields = [];
    const updateValues = [];
    
    updateFields.push('room_id = ?');
    updateValues.push(finalRoomId);
    
    // Update check_in_date if it exists, otherwise check_in
    if (booking.check_in_date !== undefined) {
      updateFields.push('check_in_date = ?');
      updateValues.push(finalCheckIn);
    } else if (booking.check_in !== undefined) {
      updateFields.push('check_in = ?');
      updateValues.push(finalCheckIn);
    }
    
    // Update check_out_date if it exists, otherwise check_out
    if (booking.check_out_date !== undefined) {
      updateFields.push('check_out_date = ?');
      updateValues.push(finalCheckOut);
    } else if (booking.check_out !== undefined) {
      updateFields.push('check_out = ?');
      updateValues.push(finalCheckOut);
    }
    
    // Handle number_of_guests vs adults
    if (booking.number_of_guests !== undefined) {
      updateFields.push('number_of_guests = ?');
      updateValues.push(adults !== undefined ? adults : (booking.number_of_guests || 1));
    } else if (booking.adults !== undefined) {
      updateFields.push('adults = ?');
      updateValues.push(adults !== undefined ? adults : (booking.adults || 1));
    }
    
    if (children !== undefined || booking.children !== undefined) {
      updateFields.push('children = ?');
      updateValues.push(children !== undefined ? children : booking.children || 0);
    }
    
    updateFields.push('status = ?');
    updateValues.push(status || booking.status);
    
    updateFields.push('payment_status = ?');
    updateValues.push(payment_status !== undefined ? payment_status : booking.payment_status);
    
    // Handle total_amount vs total_price
    if (booking.total_amount !== undefined) {
      updateFields.push('total_amount = ?');
    } else {
      updateFields.push('total_price = ?');
    }
    updateValues.push(totalPrice);
    
    updateFields.push('special_requests = ?');
    updateValues.push(special_requests !== undefined ? special_requests : booking.special_requests);
    
    updateValues.push(id);
    
    await promisePool.query(
      `UPDATE bookings SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    // Get updated booking
    const [updated] = await promisePool.query(
      `SELECT 
        b.id,
        b.guest_id,
        b.room_id,
        COALESCE(b.check_in_date, b.check_in) as check_in_date,
        COALESCE(b.check_out_date, b.check_out) as check_out_date,
        COALESCE(b.number_of_guests, b.adults, 1) as number_of_guests,
        COALESCE(b.total_amount, b.total_price, 0) as total_amount,
        b.original_amount,
        b.discount_amount,
        b.status,
        b.payment_status,
        b.special_requests,
        b.booking_reference,
        b.offer_id,
        b.created_at,
        b.updated_at,
        g.id as guest_id_full,
        g.first_name,
        g.last_name,
        g.email,
        g.phone,
        r.id as room_id_full,
        r.room_number,
        COALESCE(r.name, r.room_type) as room_name,
        COALESCE(r.type, r.room_type) as room_type,
        COALESCE(r.price, r.price_per_night) as price_per_night
      FROM bookings b
      INNER JOIN guests g ON b.guest_id = g.id
      INNER JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ?`,
      [id]
    );
    
    if (updated.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found after update'
      });
    }
    
    const updatedBooking = updated[0];
    const formattedBooking = {
      id: updatedBooking.id,
      booking_reference: updatedBooking.booking_reference || `BK${updatedBooking.id}`,
      guest_id: updatedBooking.guest_id,
      room_id: updatedBooking.room_id,
      check_in_date: updatedBooking.check_in_date,
      check_out_date: updatedBooking.check_out_date,
      number_of_guests: updatedBooking.number_of_guests || 1,
      total_amount: updatedBooking.total_amount || 0,
      original_amount: updatedBooking.original_amount || updatedBooking.total_amount || 0,
      discount_amount: updatedBooking.discount_amount || 0,
      status: updatedBooking.status,
      payment_status: updatedBooking.payment_status,
      special_requests: updatedBooking.special_requests,
      offer_id: updatedBooking.offer_id,
      created_at: updatedBooking.created_at,
      updated_at: updatedBooking.updated_at,
      guest: {
        id: updatedBooking.guest_id_full,
        first_name: updatedBooking.first_name || '',
        last_name: updatedBooking.last_name || '',
        email: updatedBooking.email || '',
        phone: updatedBooking.phone || ''
      },
      room: {
        id: updatedBooking.room_id_full,
        room_number: updatedBooking.room_number || '',
        name: updatedBooking.room_name || '',
        type: updatedBooking.room_type || '',
        price: updatedBooking.price_per_night || 0
      }
    };
    
    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: formattedBooking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating booking' 
    });
  }
});

// Delete booking
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await promisePool.query(
      'DELETE FROM bookings WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting booking' 
    });
  }
});

export default router;

