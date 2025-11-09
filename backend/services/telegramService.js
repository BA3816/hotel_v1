import axios from 'axios';

class TelegramService {
  constructor() {
    this.botToken = null;
    this.chatId = null;
    this.enabled = false;
    this.apiUrl = 'https://api.telegram.org/bot';
  }

  // Load settings from environment or database
  async loadSettings() {
    // Try to load from database first (if available)
    try {
      const { promisePool } = await import('../config/database.js');
      
      // Check if settings table exists first
      const [tables] = await promisePool.query(
        "SHOW TABLES LIKE 'settings'"
      );
      
      if (tables && tables.length > 0) {
        const [settings] = await promisePool.query(
          'SELECT * FROM settings WHERE setting_key IN (?, ?, ?)',
          ['telegram_bot_token', 'telegram_chat_id', 'telegram_enabled']
        );

        if (settings && settings.length > 0) {
          let foundToken = false;
          let foundChatId = false;
          
          settings.forEach(setting => {
            if (setting.setting_key === 'telegram_bot_token' && setting.setting_value) {
              this.botToken = setting.setting_value;
              foundToken = true;
            } else if (setting.setting_key === 'telegram_chat_id' && setting.setting_value) {
              this.chatId = setting.setting_value;
              foundChatId = true;
            } else if (setting.setting_key === 'telegram_enabled') {
              this.enabled = setting.setting_value === 'true' || setting.setting_value === '1';
            }
          });
          
          // If we found settings in database, use them (don't override with env)
          if (foundToken && foundChatId) {
            console.log('✅ Telegram settings loaded from database');
            return;
          }
        }
      }
    } catch (dbError) {
      // Settings table might not exist yet, that's okay - fall through to env vars
      if (process.env.NODE_ENV === 'development') {
        console.log('Settings table not available, using environment variables:', dbError.message);
      }
    }

    // Fallback to environment variables only if not already set
    if (!this.botToken) {
      this.botToken = process.env.TELEGRAM_BOT_TOKEN || null;
    }
    if (!this.chatId) {
      this.chatId = process.env.TELEGRAM_CHAT_ID || null;
    }
    if (process.env.TELEGRAM_ENABLED) {
      this.enabled = process.env.TELEGRAM_ENABLED === 'true';
    }
  }

  // Set bot token and chat ID
  setConfig(botToken, chatId, enabled = true) {
    this.botToken = botToken;
    this.chatId = chatId;
    this.enabled = enabled;
  }

  // Get status
  getStatus() {
    return {
      configured: !!(this.botToken && this.chatId),
      enabled: this.enabled,
      bot_token_set: !!this.botToken,
      chat_id_set: !!this.chatId
    };
  }

  // Send message to Telegram
  async sendMessage(message) {
    if (!this.botToken || !this.chatId) {
      throw new Error('Telegram bot is not configured. Please set bot token and chat ID.');
    }

    if (!this.enabled) {
      throw new Error('Telegram notifications are disabled.');
    }

    try {
      const url = `${this.apiUrl}${this.botToken}/sendMessage`;
      const chatIdDisplay = this.chatId ? `${this.chatId.toString().substring(0, 5)}...` : 'unknown';
      console.log(`📤 Sending Telegram message to chat ID: ${chatIdDisplay}`);
      
      const response = await axios.post(url, {
        chat_id: this.chatId,
        text: message,
        parse_mode: 'HTML'
      }, {
        timeout: 10000 // 10 second timeout
      });

      console.log('✅ Telegram message sent successfully');
      return {
        success: true,
        message: 'Message sent successfully',
        data: response.data
      };
    } catch (error) {
      const errorMsg = error.response?.data?.description || error.message || 'Failed to send Telegram message';
      console.error('❌ Telegram send message error:', errorMsg);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(errorMsg);
    }
  }

  // Send test message
  async sendTestMessage() {
    const testMessage = `🧪 <b>Test Notification</b>

This is a test message from your Hotel Booking System.

✅ If you received this message, your Telegram bot is configured correctly!

📅 Time: ${new Date().toLocaleString()}`;

    return await this.sendMessage(testMessage);
  }

  // Send booking notification
  async sendBookingNotification(booking) {
    // Reload settings before sending to ensure we have the latest config
    await this.loadSettings();

    // Check if Telegram is configured
    if (!this.botToken || !this.chatId) {
      console.warn('⚠️ Telegram not configured: Bot token or chat ID missing');
      throw new Error('Telegram bot is not configured. Please configure it in Settings.');
    }

    if (!this.enabled) {
      console.log('ℹ️ Telegram notifications are disabled');
      return { success: false, message: 'Telegram notifications are disabled' };
    }

    try {
      const message = `🎉 <b>New Booking Received!</b>

📋 <b>Booking Details:</b>
• Reference: ${booking.booking_reference || booking.id}
• Guest: ${booking.guest?.first_name || booking.first_name || 'N/A'} ${booking.guest?.last_name || booking.last_name || ''}
• Email: ${booking.guest?.email || booking.email || 'N/A'}
• Phone: ${booking.guest?.phone || booking.phone || 'N/A'}

🏨 <b>Room:</b>
• Room: ${booking.room?.name || booking.room_name || 'N/A'}
• Room Number: ${booking.room?.room_number || booking.room_number || 'N/A'}

📅 <b>Dates:</b>
• Check-in: ${new Date(booking.check_in_date || booking.check_in).toLocaleDateString()}
• Check-out: ${new Date(booking.check_out_date || booking.check_out).toLocaleDateString()}
• Guests: ${booking.number_of_guests || booking.adults || 1}

💰 <b>Amount:</b> $${booking.total_amount || booking.total_price || 0}

Status: ${booking.status || 'pending'}`;

      return await this.sendMessage(message);
    } catch (error) {
      console.error('❌ Error sending Telegram booking notification:', error.message);
      throw error;
    }
  }
}

// Create singleton instance
const telegramService = new TelegramService();

// Load settings on initialization
telegramService.loadSettings();

export default telegramService;

