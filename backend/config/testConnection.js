import { promisePool } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('🔄 Testing database connection...');
    console.log(`Database: ${process.env.DB_NAME || 'hotel_booking'}`);
    console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`User: ${process.env.DB_USER || 'root'}`);
    console.log(`Password: ${process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-2) : '(empty)'}`);
    console.log('');
    
    // Test connection
    const [rows] = await promisePool.query('SELECT 1 as test');
    
    if (rows.length > 0) {
      console.log('✅ Database connection successful!');
      console.log('');
      
      // Test if database exists
      const [databases] = await promisePool.query('SHOW DATABASES LIKE ?', [process.env.DB_NAME || 'hotel_booking']);
      
      if (databases.length > 0) {
        console.log(`✅ Database "${process.env.DB_NAME || 'hotel_booking'}" exists`);
        console.log('');
        
        // Check tables
        const [tables] = await promisePool.query('SHOW TABLES');
        console.log(`✅ Found ${tables.length} tables in database`);
        
        if (tables.length > 0) {
          console.log('📋 Tables:');
          tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   - ${tableName}`);
          });
        }
      } else {
        console.log(`⚠️  Database "${process.env.DB_NAME || 'hotel_booking'}" does not exist`);
        console.log('💡 Run: npm run init-db to create the database');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Database connection failed!');
    console.error('');
    console.error('Error Details:');
    console.error(`   Code: ${error.code}`);
    console.error(`   Message: ${error.message}`);
    console.error('');
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔐 PASSWORD ERROR - Your MySQL password is incorrect!');
      console.error('');
      console.error('💡 Solutions:');
      console.error('   1. Check your MySQL password in backend/.env');
      console.error('   2. Try empty password: DB_PASSWORD=');
      console.error('   3. Test with: mysql -u root -p');
      console.error('   4. See backend/FIX_MYSQL_ACCESS.md for help');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🔌 CONNECTION ERROR - MySQL server is not running!');
      console.error('');
      console.error('💡 Solutions:');
      console.error('   Windows: net start MySQL80');
      console.error('   Linux/Mac: sudo systemctl start mysql');
      console.error('   XAMPP: Start MySQL in Control Panel');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('📁 DATABASE ERROR - Database does not exist');
      console.error('💡 Run: npm run init-db');
    } else {
      console.error('💡 Please check:');
      console.error('   1. MySQL server is running');
      console.error('   2. Database credentials in .env file are correct');
      console.error('   3. Database "hotel_booking" exists or can be created');
    }
    console.error('');
    process.exit(1);
  }
};

testConnection();

