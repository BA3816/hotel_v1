import express from 'express';
import { promisePool } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get public offers (only active and public ones for public viewing)
router.get('/public', async (req, res) => {
  try {
    const { status, type, search } = req.query;
    
    let query = 'SELECT * FROM offers WHERE is_public = 1 AND status = ?';
    const params = ['active']; // Only show active public offers
    
    if (type && type !== 'all') {
      query += ' AND type = ?';
      params.push(type);
    }
    
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    // Only show offers that are currently valid (if dates are set)
    query += ' AND (valid_from IS NULL OR valid_from <= CURDATE()) AND (valid_to IS NULL OR valid_to >= CURDATE())';
    
    query += ' ORDER BY created_at DESC';
    
    const [offers] = await promisePool.query(query, params);
    
    // Format offers - parse conditions if it's JSON
    const formattedOffers = offers.map(offer => {
      let conditions = {};
      if (offer.conditions) {
        try {
          conditions = typeof offer.conditions === 'string' 
            ? JSON.parse(offer.conditions) 
            : offer.conditions;
        } catch (e) {
          conditions = {};
        }
      }
      
      return {
        ...offer,
        conditions,
        used_count: offer.used_count || 0,
        min_nights: offer.min_nights || null,
        max_uses: offer.max_uses || null
      };
    });
    
    res.json({
      success: true,
      data: formattedOffers
    });
  } catch (error) {
    console.error('Get public offers error:', error);
    // Return empty array instead of error for public endpoint
    res.json({
      success: true,
      data: []
    });
  }
});

// Get all offers
router.get('/', async (req, res) => {
  try {
    const { status, type, is_public, sort_by = 'created_at' } = req.query;
    
    let query = 'SELECT * FROM offers WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    if (is_public !== undefined) {
      query += ' AND is_public = ?';
      params.push(is_public === 'true' ? 1 : 0);
    }
    
    // Valid sort columns
    const validSortColumns = ['created_at', 'updated_at', 'name', 'discount_value', 'valid_from', 'valid_to'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    query += ` ORDER BY ${sortColumn} DESC`;
    
    const [offers] = await promisePool.query(query, params);
    
    // Format offers - parse conditions if it's JSON
    const formattedOffers = offers.map(offer => {
      let conditions = {};
      if (offer.conditions) {
        try {
          conditions = typeof offer.conditions === 'string' 
            ? JSON.parse(offer.conditions) 
            : offer.conditions;
        } catch (e) {
          conditions = {};
        }
      }
      
      return {
        ...offer,
        conditions,
        used_count: offer.used_count || 0,
        min_nights: offer.min_nights || null,
        max_uses: offer.max_uses || null
      };
    });
    
    res.json({
      success: true,
      data: formattedOffers
    });
  } catch (error) {
    console.error('Get offers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching offers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get offer statistics
router.get('/statistics', authenticate, async (req, res) => {
  try {
    const [total] = await promisePool.query('SELECT COUNT(*) as count FROM offers');
    const [active] = await promisePool.query("SELECT COUNT(*) as count FROM offers WHERE status = 'active'");
    const [expired] = await promisePool.query("SELECT COUNT(*) as count FROM offers WHERE status = 'expired'");
    const [used] = await promisePool.query('SELECT SUM(used_count) as total FROM offers');
    
    res.json({
      success: true,
      data: {
        total_offers: total[0].count || 0,
        active_offers: active[0].count || 0,
        expired_offers: expired[0].count || 0,
        total_uses: used[0].total || 0
      }
    });
  } catch (error) {
    console.error('Get offer statistics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching statistics' 
    });
  }
});

// Get single offer
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [offers] = await promisePool.query(
      'SELECT * FROM offers WHERE id = ?',
      [id]
    );
    
    if (offers.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Offer not found' 
      });
    }
    
    const offer = offers[0];
    let conditions = {};
    if (offer.conditions) {
      try {
        conditions = typeof offer.conditions === 'string' 
          ? JSON.parse(offer.conditions) 
          : offer.conditions;
      } catch (e) {
        conditions = {};
      }
    }
    
    res.json({
      success: true,
      data: {
        ...offer,
        conditions
      }
    });
  } catch (error) {
    console.error('Get offer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching offer' 
    });
  }
});

// Create new offer
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      offer_code,
      name,
      description,
      type,
      discount_type,
      discount_value,
      min_guests,
      min_nights,
      max_uses,
      valid_from,
      valid_to,
      status,
      is_public,
      conditions
    } = req.body;
    
    if (!offer_code || !name || !discount_type || discount_value === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Offer code, name, discount_type, and discount_value are required' 
      });
    }
    
    // Check if offer code already exists
    const [existing] = await promisePool.query(
      'SELECT id FROM offers WHERE offer_code = ?',
      [offer_code]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Offer code already exists' 
      });
    }
    
    // Convert conditions to JSON string if it's an object
    const conditionsJson = conditions && typeof conditions === 'object' 
      ? JSON.stringify(conditions) 
      : null;
    
    const [result] = await promisePool.query(
      `INSERT INTO offers (
        offer_code, name, description, type, discount_type, discount_value,
        min_guests, min_nights, max_uses, valid_from, valid_to,
        status, is_public, conditions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        offer_code,
        name,
        description || null,
        type || 'general',
        discount_type,
        discount_value,
        min_guests || 1,
        min_nights || null,
        max_uses || null,
        valid_from || null,
        valid_to || null,
        status || 'active',
        is_public !== undefined ? is_public : false,
        conditionsJson
      ]
    );
    
    const [newOffer] = await promisePool.query(
      'SELECT * FROM offers WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      data: newOffer[0]
    });
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating offer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update offer
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      offer_code,
      name,
      description,
      type,
      discount_type,
      discount_value,
      min_guests,
      min_nights,
      max_uses,
      valid_from,
      valid_to,
      status,
      is_public,
      conditions
    } = req.body;
    
    // Check if offer exists
    const [existing] = await promisePool.query(
      'SELECT id FROM offers WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Offer not found' 
      });
    }
    
    // Check if offer code is being changed and already exists
    if (offer_code) {
      const [codeCheck] = await promisePool.query(
        'SELECT id FROM offers WHERE offer_code = ? AND id != ?',
        [offer_code, id]
      );
      
      if (codeCheck.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Offer code already exists' 
        });
      }
    }
    
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    
    if (offer_code !== undefined) {
      updateFields.push('offer_code = ?');
      updateValues.push(offer_code);
    }
    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (type !== undefined) {
      updateFields.push('type = ?');
      updateValues.push(type);
    }
    if (discount_type !== undefined) {
      updateFields.push('discount_type = ?');
      updateValues.push(discount_type);
    }
    if (discount_value !== undefined) {
      updateFields.push('discount_value = ?');
      updateValues.push(discount_value);
    }
    if (min_guests !== undefined) {
      updateFields.push('min_guests = ?');
      updateValues.push(min_guests);
    }
    if (min_nights !== undefined) {
      updateFields.push('min_nights = ?');
      updateValues.push(min_nights);
    }
    if (max_uses !== undefined) {
      updateFields.push('max_uses = ?');
      updateValues.push(max_uses);
    }
    if (valid_from !== undefined) {
      updateFields.push('valid_from = ?');
      updateValues.push(valid_from);
    }
    if (valid_to !== undefined) {
      updateFields.push('valid_to = ?');
      updateValues.push(valid_to);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    if (is_public !== undefined) {
      updateFields.push('is_public = ?');
      updateValues.push(is_public);
    }
    if (conditions !== undefined) {
      const conditionsJson = typeof conditions === 'object' 
        ? JSON.stringify(conditions) 
        : conditions;
      updateFields.push('conditions = ?');
      updateValues.push(conditionsJson);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No fields to update' 
      });
    }
    
    updateValues.push(id);
    
    await promisePool.query(
      `UPDATE offers SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    const [updated] = await promisePool.query(
      'SELECT * FROM offers WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Offer updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Update offer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating offer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete offer
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if offer exists
    const [existing] = await promisePool.query(
      'SELECT id FROM offers WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Offer not found' 
      });
    }
    
    // Check if offer is used in bookings
    const [bookings] = await promisePool.query(
      'SELECT COUNT(*) as count FROM bookings WHERE offer_id = ?',
      [id]
    );
    
    if (bookings[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete offer that has been used in bookings' 
      });
    }
    
    await promisePool.query(
      'DELETE FROM offers WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Offer deleted successfully'
    });
  } catch (error) {
    console.error('Delete offer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting offer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

