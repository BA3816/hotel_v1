import telegramService from '../services/telegramService.js';
import dotenv from 'dotenv';

dotenv.config();

async function testTelegram() {
  console.log('🧪 Testing Telegram Bot Configuration\n');

  // Check if bot token and chat ID are set
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log('⚠️  Telegram bot not configured via environment variables');
    console.log('   You can configure it through the Admin Settings page\n');
    
    console.log('📋 To test manually:');
    console.log('   1. Go to Admin Settings > Telegram');
    console.log('   2. Enter your bot token from @BotFather');
    console.log('   3. Enter your chat ID from @userinfobot');
    console.log('   4. Click "Send Test Message"\n');
    
    process.exit(0);
  }

  console.log('✅ Bot Token: Found');
  console.log('✅ Chat ID: Found\n');

  // Configure service
  telegramService.setConfig(botToken, chatId, true);

  try {
    console.log('📤 Sending test message...');
    const result = await telegramService.sendTestMessage();
    
    if (result.success) {
      console.log('✅ Test message sent successfully!');
      console.log('   Check your Telegram to confirm receipt.\n');
    }
  } catch (error) {
    console.error('❌ Failed to send test message:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   - Verify bot token is correct');
    console.log('   - Make sure you sent a message to your bot first');
    console.log('   - Check that chat ID is correct');
    console.log('   - Ensure bot is not blocked\n');
  }

  process.exit(0);
}

testTelegram();

