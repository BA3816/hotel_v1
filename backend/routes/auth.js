import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { promisePool } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    const [users] = await promisePool.query(
      'SELECT * FROM admins WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        sqlMessage: error.sqlMessage
      } : undefined
    });
  }
});

// Register (admin only)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username, email, and password are required' 
      });
    }

    // Check if user already exists
    const [existingUsers] = await promisePool.query(
      'SELECT id FROM admins WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username or email already exists' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] =     await promisePool.query(
      'INSERT INTO admins (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, full_name || null, 'admin']
    );

    // Generate token for auto-login
    const token = jwt.sign(
      { id: result.insertId, username, role: 'admin' },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    // Get created user
    const [newUser] = await promisePool.query(
      'SELECT id, username, email, full_name, role FROM admins WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      token,
      user: newUser[0],
      userId: result.insertId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// Verify token
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
    
    const [users] = await promisePool.query(
      'SELECT id, username, email, full_name, role FROM admins WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
});

// Logout (just clears token on client side, but we can add server-side token blacklist if needed)
router.post('/logout', async (req, res) => {
  try {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return success - client will clear the token
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during logout' 
    });
  }
});

// Get user profile (using authenticate middleware)
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [users] = await promisePool.query(
      'SELECT id, username, email, full_name, role, created_at, updated_at FROM admins WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = users[0];

    // Map to frontend expected format
    const profileData = {
      id: user.id,
      name: user.full_name || '',
      email: user.email || '',
      username: user.username || '',
      phone: '', // Not in admins table
      address: '', // Not in admins table
      city: '', // Not in admins table
      country: '', // Not in admins table
      postal_code: '', // Not in admins table
      date_of_birth: '', // Not in admins table
      gender: '', // Not in admins table
      department: '', // Not in admins table
      position: user.role || '', // Use role as position
      hire_date: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '', // Use created_at as hire_date
      bio: '', // Not in admins table
      role: user.role || '',
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    res.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user profile (using authenticate middleware)
router.put('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, address, city, country, postal_code, date_of_birth, gender, department, position, hire_date, bio } = req.body;

    // Check if user exists
    const [existing] = await promisePool.query(
      'SELECT id, email FROM admins WHERE id = ?',
      [userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if email is being changed and already exists
    if (email && email !== existing[0].email) {
      const [emailCheck] = await promisePool.query(
        'SELECT id FROM admins WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already in use' 
        });
      }
    }

    // Update only fields that exist in admins table
    // Note: admins table only has: id, username, email, password, full_name, role
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('full_name = ?');
      updateValues.push(name);
    }

    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    // Role is always admin - cannot be changed
    // if (position !== undefined && position === 'admin') {
    //   updateFields.push('role = ?');
    //   updateValues.push('admin');
    // }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No valid fields to update' 
      });
    }

    updateValues.push(userId);

    await promisePool.query(
      `UPDATE admins SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated user
    const [updated] = await promisePool.query(
      'SELECT id, username, email, full_name, role, created_at, updated_at FROM admins WHERE id = ?',
      [userId]
    );

    const user = updated[0];

    // Return in frontend expected format
    const profileData = {
      id: user.id,
      name: user.full_name || '',
      email: user.email || '',
      username: user.username || '',
      phone: phone || '',
      address: address || '',
      city: city || '',
      country: country || '',
      postal_code: postal_code || '',
      date_of_birth: date_of_birth || '',
      gender: gender || '',
      department: department || '',
      position: user.role || '',
      hire_date: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '',
      bio: bio || '',
      role: user.role || ''
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profileData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update password (using authenticate middleware) - supports both POST and PUT
router.post('/update-password', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    // Support both naming conventions: currentPassword/newPassword and current_password/new_password
    const currentPassword = req.body.currentPassword || req.body.current_password;
    const newPassword = req.body.newPassword || req.body.new_password;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters long' 
      });
    }

    // Get current user
    const [users] = await promisePool.query(
      'SELECT id, password FROM admins WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = users[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await promisePool.query(
      'UPDATE admins SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Also support PUT for password update
router.put('/update-password', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    // Support both naming conventions: currentPassword/newPassword and current_password/new_password
    const currentPassword = req.body.currentPassword || req.body.current_password;
    const newPassword = req.body.newPassword || req.body.new_password;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters long' 
      });
    }

    // Get current user
    const [users] = await promisePool.query(
      'SELECT id, password FROM admins WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = users[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await promisePool.query(
      'UPDATE admins SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

