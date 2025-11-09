import jwt from 'jsonwebtoken';
import { promisePool } from '../config/database.js';

export const authenticateVisitor = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    
    // Check if it's a visitor token
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

    req.visitor = visitors[0];
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

