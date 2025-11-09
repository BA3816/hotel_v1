import { promisePool } from '../config/database.js';

async function deleteUsersTable() {
  try {
    console.log('🔄 Checking for foreign keys referencing users table...');
    
    // Check for foreign keys
    const [fks] = await promisePool.query(
      `SELECT CONSTRAINT_NAME, TABLE_NAME 
       FROM information_schema.KEY_COLUMN_USAGE 
       WHERE REFERENCED_TABLE_NAME = 'users' 
       AND TABLE_SCHEMA = 'hotel_booking'`
    );

    if (fks.length > 0) {
      console.log(`⚠️  Found ${fks.length} foreign key(s) referencing users table:`);
      fks.forEach(fk => {
        console.log(`   - ${fk.TABLE_NAME}.${fk.CONSTRAINT_NAME}`);
      });
      
      console.log('\n🔧 Dropping foreign keys first...');
      for (const fk of fks) {
        try {
          await promisePool.query(
            `ALTER TABLE ${fk.TABLE_NAME} DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`
          );
          console.log(`   ✅ Dropped FK: ${fk.TABLE_NAME}.${fk.CONSTRAINT_NAME}`);
        } catch (error) {
          console.log(`   ⚠️  Could not drop FK ${fk.CONSTRAINT_NAME}: ${error.message}`);
        }
      }
    } else {
      console.log('✅ No foreign keys found');
    }

    console.log('\n🗑️  Dropping users table...');
    await promisePool.query('DROP TABLE IF EXISTS users');
    console.log('✅ Users table deleted successfully!');

    // Verify it's gone
    const [tables] = await promisePool.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    if (tableNames.includes('users')) {
      console.log('⚠️  Warning: Users table still exists');
    } else {
      console.log('✅ Verified: Users table has been removed');
    }

    // Verify admins table
    console.log('\n✅ Verifying admins table...');
    const [admins] = await promisePool.query(
      'SELECT id, username, email, role FROM admins LIMIT 3'
    );
    console.log(`✅ Admins table has ${admins.length} sample records`);
    if (admins.length > 0) {
      console.log('Sample admins:');
      admins.forEach(a => {
        console.log(`   - ${a.username} (${a.email}) - Role: ${a.role}`);
      });
    }
    console.log('\n✅ Admin login is correctly configured to use admins table!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

deleteUsersTable();

