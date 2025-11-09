import { promisePool } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

const testDatabaseConnection = async () => {
  console.log('🔄 Starting comprehensive database connection test...\n');
  console.log('📋 Configuration:');
  console.log(`   Database: ${process.env.DB_NAME || 'hotel_booking'}`);
  console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   User: ${process.env.DB_USER || 'root'}`);
  console.log(`   Port: ${process.env.DB_PORT || 3306}\n`);

  try {
    // Test 1: Basic connection
    console.log('Test 1: Basic Connection Test');
    const [testRows] = await promisePool.query('SELECT 1 as test');
    if (testRows.length > 0 && testRows[0].test === 1) {
      console.log('✅ PASSED: Basic connection successful\n');
    } else {
      throw new Error('Basic connection test failed');
    }

    // Test 2: List all tables
    console.log('Test 2: Database Tables Test');
    const [tables] = await promisePool.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log(`✅ PASSED: Found ${tableNames.length} tables`);
    console.log(`   Tables: ${tableNames.join(', ')}\n`);

    // Test 3: Check critical tables exist
    console.log('Test 3: Critical Tables Check');
    const criticalTables = ['rooms', 'bookings', 'guests', 'admins', 'offers'];
    const missingTables = criticalTables.filter(t => !tableNames.includes(t));
    if (missingTables.length === 0) {
      console.log('✅ PASSED: All critical tables exist\n');
    } else {
      console.log(`⚠️  WARNING: Missing tables: ${missingTables.join(', ')}\n`);
    }

    // Test 4: Get database statistics
    console.log('Test 4: Database Statistics');
    const [stats] = await promisePool.query(`
      SELECT 
        (SELECT COUNT(*) FROM rooms) as rooms,
        (SELECT COUNT(*) FROM bookings) as bookings,
        (SELECT COUNT(*) FROM guests) as guests,
        (SELECT COUNT(*) FROM admins) as admins,
        (SELECT COUNT(*) FROM offers) as offers
    `);
    console.log('✅ PASSED: Statistics retrieved');
    console.log(`   Rooms: ${stats[0].rooms}`);
    console.log(`   Bookings: ${stats[0].bookings}`);
    console.log(`   Guests: ${stats[0].guests}`);
    console.log(`   Admins: ${stats[0].admins}`);
    console.log(`   Offers: ${stats[0].offers}\n`);

    // Test 5: Query rooms table
    console.log('Test 5: Rooms Table Query');
    const [rooms] = await promisePool.query(`
      SELECT id, room_number, name, type, price, status 
      FROM rooms 
      LIMIT 3
    `);
    console.log(`✅ PASSED: Retrieved ${rooms.length} sample rooms`);
    rooms.forEach(r => {
      console.log(`   - ${r.room_number}: ${r.name} (${r.type}) - $${r.price} - ${r.status}`);
    });
    console.log('');

    // Test 6: Query bookings table
    console.log('Test 6: Bookings Table Query');
    const [bookings] = await promisePool.query(`
      SELECT id, booking_reference, check_in_date, check_out_date, status 
      FROM bookings 
      LIMIT 3
    `);
    console.log(`✅ PASSED: Retrieved ${bookings.length} sample bookings`);
    bookings.forEach(b => {
      console.log(`   - ${b.booking_reference}: ${b.check_in_date} to ${b.check_out_date} - ${b.status}`);
    });
    console.log('');

    // Test 7: Query guests table
    console.log('Test 7: Guests Table Query');
    const [guests] = await promisePool.query(`
      SELECT id, first_name, last_name, email 
      FROM guests 
      LIMIT 3
    `);
    console.log(`✅ PASSED: Retrieved ${guests.length} sample guests`);
    guests.forEach(g => {
      console.log(`   - ${g.first_name} ${g.last_name} (${g.email})`);
    });
    console.log('');

    // Test 8: Test complex join query
    console.log('Test 8: Complex Join Query');
    const [joinResults] = await promisePool.query(`
      SELECT 
        b.booking_reference,
        r.name as room_name,
        g.first_name,
        g.last_name,
        b.check_in_date,
        b.check_out_date
      FROM bookings b
      INNER JOIN rooms r ON b.room_id = r.id
      INNER JOIN guests g ON b.guest_id = g.id
      LIMIT 3
    `);
    console.log(`✅ PASSED: Complex join query successful`);
    console.log(`   Retrieved ${joinResults.length} booking records with joins\n`);

    // Test 9: Test connection pool
    console.log('Test 9: Connection Pool Test');
    const pool = promisePool.pool;
    console.log(`✅ PASSED: Connection pool active`);
    console.log(`   Active connections: ${pool._allConnections.length}`);
    console.log(`   Free connections: ${pool._freeConnections.length}`);
    console.log(`   Connection limit: ${pool.config.connectionLimit}\n`);

    // Final summary
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ ALL DATABASE CONNECTION TESTS PASSED!');
    console.log('✅ Database is fully operational and ready to use');
    console.log('═══════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ DATABASE CONNECTION TEST FAILED!');
    console.error('═══════════════════════════════════════════════════');
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code || 'N/A'}`);
    console.error(`SQL Message: ${error.sqlMessage || 'N/A'}`);
    console.error('═══════════════════════════════════════════════════\n');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Solution: MySQL server is not running.');
      console.error('   Start MySQL service: net start MySQL80 (Windows)');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Solution: Check your MySQL username and password in .env file');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Solution: Database does not exist. Run: npm run init-db');
    }
    
    process.exit(1);
  }
};

testDatabaseConnection();

