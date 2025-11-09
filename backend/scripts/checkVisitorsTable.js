import { promisePool } from '../config/database.js';

async function checkVisitorsTable() {
  try {
    const [tables] = await promisePool.query("SHOW TABLES LIKE 'visitors'");
    
    if (tables.length > 0) {
      console.log('✅ Visitors table exists');
      const [cols] = await promisePool.query('DESCRIBE visitors');
      console.log('\nColumns:');
      cols.forEach(c => console.log(`  - ${c.Field} (${c.Type})`));
    } else {
      console.log('❌ Visitors table does NOT exist');
      console.log('\nCreating visitors table...');
      
      await promisePool.query(`
        CREATE TABLE IF NOT EXISTS visitors (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Visitors table created successfully!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkVisitorsTable();

