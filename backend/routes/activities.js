import express from 'express';
import { promisePool } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get public activities (only active ones for public viewing)
router.get('/public', async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = 'SELECT * FROM activities WHERE is_active = 1';
    const params = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [activities] = await promisePool.query(query, params);
    
    // Format activities
    const formattedActivities = activities.map(activity => {
      // Parse available_days if it's a JSON string
      let availableDays = [];
      if (activity.available_days) {
        try {
          availableDays = typeof activity.available_days === 'string' 
            ? JSON.parse(activity.available_days) 
            : activity.available_days;
        } catch (e) {
          availableDays = [];
        }
      }
      
      // Format duration
      const hours = Math.floor(activity.duration_minutes / 60);
      const minutes = activity.duration_minutes % 60;
      let formattedDuration = '';
      if (hours > 0) {
        formattedDuration = `${hours}h`;
      }
      if (minutes > 0) {
        formattedDuration += `${formattedDuration ? ' ' : ''}${minutes}m`;
      }
      if (!formattedDuration) {
        formattedDuration = `${activity.duration_minutes}m`;
      }
      
      // Difficulty color mapping
      const difficultyColors = {
        easy: 'bg-green-100 text-green-800',
        moderate: 'bg-yellow-100 text-yellow-800',
        hard: 'bg-red-100 text-red-800'
      };
      
      return {
        ...activity,
        available_days: availableDays,
        formatted_duration: formattedDuration,
        difficulty_color: difficultyColors[activity.difficulty_level] || 'bg-gray-100 text-gray-800',
        rating: activity.rating || 0,
        total_reviews: activity.total_reviews || 0
      };
    });
    
    res.json({
      success: true,
      data: formattedActivities
    });
  } catch (error) {
    console.error('Get public activities error:', error);
    // Return empty array instead of error for public endpoint
    // This prevents the page from breaking if activities table doesn't exist yet
    res.json({
      success: true,
      data: []
    });
  }
});

// Get all activities
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = 'SELECT * FROM activities WHERE 1=1';
    const params = [];
    
    if (status === 'active') {
      query += ' AND is_active = 1';
    } else if (status === 'inactive') {
      query += ' AND is_active = 0';
    }
    
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [activities] = await promisePool.query(query, params);
    
    // Format activities
    const formattedActivities = activities.map(activity => {
      // Parse available_days if it's a JSON string
      let availableDays = [];
      if (activity.available_days) {
        try {
          availableDays = typeof activity.available_days === 'string' 
            ? JSON.parse(activity.available_days) 
            : activity.available_days;
        } catch (e) {
          availableDays = [];
        }
      }
      
      // Format duration
      const hours = Math.floor(activity.duration_minutes / 60);
      const minutes = activity.duration_minutes % 60;
      let formattedDuration = '';
      if (hours > 0) {
        formattedDuration = `${hours}h`;
      }
      if (minutes > 0) {
        formattedDuration += `${formattedDuration ? ' ' : ''}${minutes}m`;
      }
      if (!formattedDuration) {
        formattedDuration = `${activity.duration_minutes}m`;
      }
      
      // Difficulty color mapping
      const difficultyColors = {
        easy: 'bg-green-100 text-green-800',
        moderate: 'bg-yellow-100 text-yellow-800',
        hard: 'bg-red-100 text-red-800'
      };
      
      return {
        ...activity,
        available_days: availableDays,
        formatted_duration: formattedDuration,
        difficulty_color: difficultyColors[activity.difficulty_level] || 'bg-gray-100 text-gray-800',
        rating: activity.rating || 0,
        total_reviews: activity.total_reviews || 0,
        total_bookings: activity.total_bookings || 0,
        confirmed_bookings: activity.confirmed_bookings || 0
      };
    });
    
    res.json({
      success: true,
      data: formattedActivities
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching activities' 
    });
  }
});

// Get single activity
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [activities] = await promisePool.query(
      'SELECT * FROM activities WHERE id = ?',
      [id]
    );
    
    if (activities.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Activity not found' 
      });
    }
    
    const activity = activities[0];
    
    // Parse available_days
    let availableDays = [];
    if (activity.available_days) {
      try {
        availableDays = typeof activity.available_days === 'string' 
          ? JSON.parse(activity.available_days) 
          : activity.available_days;
      } catch (e) {
        availableDays = [];
      }
    }
    
    // Format duration
    const hours = Math.floor(activity.duration_minutes / 60);
    const minutes = activity.duration_minutes % 60;
    let formattedDuration = '';
    if (hours > 0) {
      formattedDuration = `${hours}h`;
    }
    if (minutes > 0) {
      formattedDuration += `${formattedDuration ? ' ' : ''}${minutes}m`;
    }
    if (!formattedDuration) {
      formattedDuration = `${activity.duration_minutes}m`;
    }
    
    const difficultyColors = {
      easy: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    
    res.json({
      success: true,
      data: {
        ...activity,
        available_days: availableDays,
        formatted_duration: formattedDuration,
        difficulty_color: difficultyColors[activity.difficulty_level] || 'bg-gray-100 text-gray-800',
        rating: activity.rating || 0,
        total_reviews: activity.total_reviews || 0
      }
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching activity' 
    });
  }
});

// Create new activity
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      name,
      description,
      short_description,
      price,
      duration_minutes,
      max_participants,
      min_participants,
      difficulty_level,
      location,
      meeting_point,
      available_days,
      start_time,
      end_time,
      image_url,
      is_active,
      advance_booking_hours,
      what_to_bring
    } = req.body;
    
    if (!name || !description || price === undefined || !duration_minutes) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, description, price, and duration are required' 
      });
    }
    
    // Convert available_days array to JSON string
    const availableDaysJson = available_days && Array.isArray(available_days) 
      ? JSON.stringify(available_days) 
      : null;
    
    const [result] = await promisePool.query(
      `INSERT INTO activities (
        name, description, short_description, price, duration_minutes,
        max_participants, min_participants, difficulty_level, location,
        meeting_point, available_days, start_time, end_time, image_url,
        is_active, advance_booking_hours, what_to_bring
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        short_description || null,
        price,
        duration_minutes,
        max_participants || 10,
        min_participants || 1,
        difficulty_level || 'easy',
        location || null,
        meeting_point || null,
        availableDaysJson,
        start_time || null,
        end_time || null,
        image_url || null,
        is_active !== undefined ? is_active : true,
        advance_booking_hours || 24,
        what_to_bring || null
      ]
    );
    
    const [newActivity] = await promisePool.query(
      'SELECT * FROM activities WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: newActivity[0]
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update activity
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      short_description,
      price,
      duration_minutes,
      max_participants,
      min_participants,
      difficulty_level,
      location,
      meeting_point,
      available_days,
      start_time,
      end_time,
      image_url,
      is_active,
      advance_booking_hours,
      what_to_bring
    } = req.body;
    
    // Check if activity exists
    const [existing] = await promisePool.query(
      'SELECT id FROM activities WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Activity not found' 
      });
    }
    
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    
    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (short_description !== undefined) {
      updateFields.push('short_description = ?');
      updateValues.push(short_description);
    }
    if (price !== undefined) {
      updateFields.push('price = ?');
      updateValues.push(price);
    }
    if (duration_minutes !== undefined) {
      updateFields.push('duration_minutes = ?');
      updateValues.push(duration_minutes);
    }
    if (max_participants !== undefined) {
      updateFields.push('max_participants = ?');
      updateValues.push(max_participants);
    }
    if (min_participants !== undefined) {
      updateFields.push('min_participants = ?');
      updateValues.push(min_participants);
    }
    if (difficulty_level !== undefined) {
      updateFields.push('difficulty_level = ?');
      updateValues.push(difficulty_level);
    }
    if (location !== undefined) {
      updateFields.push('location = ?');
      updateValues.push(location);
    }
    if (meeting_point !== undefined) {
      updateFields.push('meeting_point = ?');
      updateValues.push(meeting_point);
    }
    if (available_days !== undefined) {
      const availableDaysJson = Array.isArray(available_days) 
        ? JSON.stringify(available_days) 
        : null;
      updateFields.push('available_days = ?');
      updateValues.push(availableDaysJson);
    }
    if (start_time !== undefined) {
      updateFields.push('start_time = ?');
      updateValues.push(start_time);
    }
    if (end_time !== undefined) {
      updateFields.push('end_time = ?');
      updateValues.push(end_time);
    }
    if (image_url !== undefined) {
      updateFields.push('image_url = ?');
      updateValues.push(image_url);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active);
    }
    if (advance_booking_hours !== undefined) {
      updateFields.push('advance_booking_hours = ?');
      updateValues.push(advance_booking_hours);
    }
    if (what_to_bring !== undefined) {
      updateFields.push('what_to_bring = ?');
      updateValues.push(what_to_bring);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No fields to update' 
      });
    }
    
    updateValues.push(id);
    
    await promisePool.query(
      `UPDATE activities SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    const [updated] = await promisePool.query(
      'SELECT * FROM activities WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Activity updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete activity
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if activity exists
    const [existing] = await promisePool.query(
      'SELECT id FROM activities WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Activity not found' 
      });
    }
    
    await promisePool.query(
      'DELETE FROM activities WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

