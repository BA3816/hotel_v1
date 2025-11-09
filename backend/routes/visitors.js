import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { promisePool } from '../config/database.js';
import { authenticateVisitor } from '../middleware/visitorAuth.js';

const router = express.Router();

// Visitor Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const [visitors] = await promisePool.query(
      'SELECT * FROM visitors WHERE email = ?',
      [email]
    );

    if (visitors.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const visitor = visitors[0];
    const isValidPassword = await bcrypt.compare(password, visitor.password);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const token = jwt.sign(
      { id: visitor.id, email: visitor.email, type: 'visitor' },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '30d' }
    );

    // Remove password from response
    const { password: _, ...visitorWithoutPassword } = visitor;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      visitor: visitorWithoutPassword
    });
  } catch (error) {
    console.error('Visitor login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Visitor Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, password_confirmation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required' 
      });
    }

    if (password !== password_confirmation) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if visitor already exists
    const [existingVisitors] = await promisePool.query(
      'SELECT id FROM visitors WHERE email = ?',
      [email]
    );

    if (existingVisitors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await promisePool.query(
      'INSERT INTO visitors (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // Generate token for auto-login
    const token = jwt.sign(
      { id: result.insertId, email, type: 'visitor' },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '30d' }
    );

    // Get created visitor
    const [newVisitor] = await promisePool.query(
      'SELECT id, name, email, phone, created_at FROM visitors WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      visitor: newVisitor[0]
    });
  } catch (error) {
    console.error('Visitor registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify visitor token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    
    if (decoded.type !== 'visitor') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token type' 
      });
    }

    const [visitors] = await promisePool.query(
      'SELECT id, name, email, phone, created_at FROM visitors WHERE id = ?',
      [decoded.id]
    );

    if (visitors.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Visitor not found' 
      });
    }

    res.json({
      success: true,
      visitor: visitors[0]
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
});

// Get visitor profile (protected)
router.get('/profile', authenticateVisitor, async (req, res) => {
  try {
    const visitorId = req.visitor.id;
    
    const [visitors] = await promisePool.query(
      'SELECT id, name, email, phone, date_of_birth, nationality, emergency_contact, created_at, updated_at FROM visitors WHERE id = ?',
      [visitorId]
    );

    if (visitors.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Visitor not found' 
      });
    }

    res.json({
      success: true,
      visitor: visitors[0]
    });
  } catch (error) {
    console.error('Get visitor profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Visitor Logout
router.post('/logout', authenticateVisitor, async (req, res) => {
  try {
    // Since we're using JWT tokens, logout is mainly client-side
    // The token will be invalidated when it expires
    // You could implement token blacklisting here if needed
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Visitor logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
});

// Get visitor bookings (protected)
router.get('/bookings', authenticateVisitor, async (req, res) => {
  try {
    const visitorEmail = req.visitor.email;
    
    // First, check what columns actually exist in the tables
    let bookings = [];
    
    try {
      // Get column names from bookings table
      const [bookingColumns] = await promisePool.query('DESCRIBE bookings');
      const bookingColNames = bookingColumns.map(c => c.Field);
      
      // Get column names from rooms table
      const [roomColumns] = await promisePool.query('DESCRIBE rooms');
      const roomColNames = roomColumns.map(c => c.Field);
      
      console.log('Bookings columns:', bookingColNames);
      console.log('Rooms columns:', roomColNames);
      
      // Determine which columns to use
      const checkInCol = bookingColNames.includes('check_in_date') ? 'b.check_in_date' : 'b.check_in';
      const checkOutCol = bookingColNames.includes('check_out_date') ? 'b.check_out_date' : 'b.check_out';
      const totalCol = bookingColNames.includes('total_amount') ? 'b.total_amount' : 'b.total_price';
      const hasAdults = bookingColNames.includes('adults');
      const hasChildren = bookingColNames.includes('children');
      const hasNumberOfGuests = bookingColNames.includes('number_of_guests');
      const hasBookingRef = bookingColNames.includes('booking_reference');
      
      const roomTypeCol = roomColNames.includes('room_type') ? 'r.room_type' : 
                         roomColNames.includes('type') ? 'r.type' : "''";
      const roomPriceCol = roomColNames.includes('price_per_night') ? 'r.price_per_night' : 
                          roomColNames.includes('price') ? 'r.price' : '0';
      const roomDescCol = roomColNames.includes('description') ? 'r.description' : 
                         roomColNames.includes('name') ? 'r.name' : "''";
      
      // Build guests calculation
      let guestsCalc = '1';
      if (hasNumberOfGuests) {
        guestsCalc = 'b.number_of_guests';
      } else if (hasAdults && hasChildren) {
        guestsCalc = '(COALESCE(b.adults, 1) + COALESCE(b.children, 0))';
      } else if (hasAdults) {
        guestsCalc = 'COALESCE(b.adults, 1)';
      }
      
      // Build the query with only columns that exist
      let selectFields = [
        'b.id',
        'b.guest_id',
        'b.room_id',
        `${checkInCol} as check_in`,
        `${checkOutCol} as check_out`,
        `${guestsCalc} as number_of_guests_calc`,
        `${totalCol} as total_price`,
        'b.status',
        'g.first_name',
        'g.last_name',
        'g.email as guest_email',
        'g.phone as guest_phone',
        'r.room_number',
        `${roomTypeCol} as room_type`,
        `${roomPriceCol} as price_per_night`,
        'COALESCE(r.capacity, 1) as capacity',
        `${roomDescCol} as description`,
        'r.image_url',
        'b.created_at',
        'b.updated_at'
      ];
      
      if (hasAdults) selectFields.push('b.adults');
      if (hasChildren) selectFields.push('b.children');
      if (bookingColNames.includes('payment_status')) selectFields.push('b.payment_status');
      if (bookingColNames.includes('special_requests')) selectFields.push('b.special_requests');
      if (hasBookingRef) selectFields.push('b.booking_reference');
      
      const query = `
        SELECT 
          ${selectFields.join(',\n          ')}
        FROM bookings b
        INNER JOIN guests g ON b.guest_id = g.id
        LEFT JOIN rooms r ON b.room_id = r.id
        WHERE LOWER(g.email) = LOWER(?)
        ORDER BY b.created_at DESC
      `;
      
      console.log('Executing query for visitor:', visitorEmail);
      const [result] = await promisePool.query(query, [visitorEmail]);
      bookings = result;
    } catch (queryError) {
      console.error('Query error:', queryError.message);
      console.error('Error stack:', queryError.stack);
      throw queryError;
    }

    // If no bookings found, return empty array (not an error)
    if (!bookings || bookings.length === 0) {
      return res.json({
        success: true,
        bookings: []
      });
    }

    // Format bookings for frontend
    const formattedBookings = bookings.map(booking => {
      // Handle different column name variations
      const checkIn = booking.check_in;
      const checkOut = booking.check_out;
      const totalPrice = booking.total_price || 0;
      // number_of_guests_calc is already calculated in the query
      const numberOfGuests = booking.number_of_guests_calc || 1;
      
      return {
        id: booking.id,
        booking_reference: booking.booking_reference || `BK${String(booking.id).padStart(6, '0')}`,
        check_in: checkIn,
        check_out: checkOut,
        number_of_guests: numberOfGuests,
        total_amount: parseFloat(totalPrice) || 0,
        status: booking.status || 'pending',
        special_requests: booking.special_requests || null,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        room: booking.room_id ? {
          id: booking.room_id,
          name: booking.description || `${booking.room_type || 'Room'}`,
          room_number: booking.room_number || '',
          type: booking.room_type || '',
          capacity: booking.capacity || 1,
          price: parseFloat(booking.price_per_night) || 0,
          image_url: booking.image_url || null
        } : null,
        guest: {
          id: booking.guest_id,
          name: `${booking.first_name || ''} ${booking.last_name || ''}`.trim() || 'Guest',
          email: booking.guest_email || '',
          phone: booking.guest_phone || null
        }
      };
    });

    res.json({
      success: true,
      bookings: formattedBookings
    });
  } catch (error) {
    console.error('Get visitor bookings error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      errno: error.errno
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching bookings',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        sqlMessage: error.sqlMessage,
        code: error.code
      } : undefined
    });
  }
});

export default router;

