import express from 'express';
import { authenticate } from '../middleware/auth.js';
import telegramService from '../services/telegramService.js';
import { promisePool } from '../config/database.js';

const router = express.Router();

// Get Telegram status
router.get('/status', authenticate, async (req, res) => {
  try {
    let botToken = null;
    let chatId = null;
    let enabled = false;

    // Try to load from database settings table (if exists)
    try {
      const [settings] = await promisePool.query(
        'SELECT * FROM settings WHERE setting_key IN (?, ?, ?)',
        ['telegram_bot_token', 'telegram_chat_id', 'telegram_enabled']
      );

      settings.forEach(setting => {
        if (setting.setting_key === 'telegram_bot_token') {
          botToken = setting.setting_value;
        } else if (setting.setting_key === 'telegram_chat_id') {
          chatId = setting.setting_value;
        } else if (setting.setting_key === 'telegram_enabled') {
          enabled = setting.setting_value === 'true' || setting.setting_value === '1';
        }
      });
    } catch (dbError) {
      // Settings table doesn't exist, use environment variables or keep defaults
      botToken = process.env.TELEGRAM_BOT_TOKEN || null;
      chatId = process.env.TELEGRAM_CHAT_ID || null;
      enabled = process.env.TELEGRAM_ENABLED === 'true' || false;
    }

    // Update service with loaded settings
    if (botToken && chatId) {
      telegramService.setConfig(botToken, chatId, enabled);
    }

    const status = telegramService.getStatus();

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get Telegram status error:', error);
    // Return default status if everything fails
    res.json({
      success: true,
      data: telegramService.getStatus()
    });
  }
});

// Save Telegram settings
router.post('/settings', authenticate, async (req, res) => {
  try {
    const { bot_token, chat_id, enabled } = req.body;

    if (!bot_token || !chat_id) {
      return res.status(400).json({
        success: false,
        message: 'Bot token and chat ID are required'
      });
    }

    // Validate bot token format (should be like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)
    if (!bot_token.match(/^\d+:[A-Za-z0-9_-]+$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bot token format'
      });
    }

    // Validate chat ID (should be numeric)
    if (!chat_id.match(/^-?\d+$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat ID format (must be numeric)'
      });
    }

    // Save to database (create settings table if it doesn't exist)
    try {
      // Check if settings table exists, create if not
      await promisePool.query(`
        CREATE TABLE IF NOT EXISTS settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          setting_key VARCHAR(255) UNIQUE NOT NULL,
          setting_value TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Save settings
      await promisePool.query(
        `INSERT INTO settings (setting_key, setting_value) 
         VALUES (?, ?), (?, ?), (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [
          'telegram_bot_token', bot_token,
          'telegram_chat_id', chat_id,
          'telegram_enabled', enabled ? 'true' : 'false'
        ]
      );
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Continue anyway - settings are stored in service instance
    }

    // Update service
    telegramService.setConfig(bot_token, chat_id, enabled);

    res.json({
      success: true,
      message: 'Telegram settings saved successfully'
    });
  } catch (error) {
    console.error('Save Telegram settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving Telegram settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Send test message
router.post('/test', authenticate, async (req, res) => {
  try {
    const result = await telegramService.sendTestMessage();
    res.json(result);
  } catch (error) {
    console.error('Send test message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send test message'
    });
  }
});

export default router;

