const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

async function migrateTimezones() {
  await client.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    console.log('Fetching all timestamp without time zone columns in nex_core...');
    const res = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'nex_core' 
        AND data_type = 'timestamp without time zone';
    `);

    const columns = res.rows;
    console.log(`Found ${columns.length} columns to update.`);

    for (const col of columns) {
      const { table_name, column_name } = col;
      console.log(`Updating nex_core."${table_name}"."${column_name}"...`);
      
      // Using current_setting('TIMEZONE') ensures that existing local time values 
      // are interpreted using the database's current timezone.
      await client.query(`
        ALTER TABLE nex_core."${table_name}" 
        ALTER COLUMN "${column_name}" 
        TYPE timestamptz 
        USING "${column_name}" AT TIME ZONE current_setting('TIMEZONE');
      `);
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log('Successfully updated all timestamp columns to timestamptz!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error occurred, transaction rolled back.', err);
  } finally {
    await client.end();
  }
}

migrateTimezones();
