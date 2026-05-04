const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'postgres'
});

async function renameDatabase() {
  try {
    await client.connect();
    
    // Terminate all other connections to the database
    console.log('Terminating connections to nexone_template...');
    await client.query(`
      SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE datname = 'nexone_template' AND pid <> pg_backend_pid();
    `);
    
    // Rename the database
    console.log('Renaming database nexone_template to nexone_template...');
    await client.query(`ALTER DATABASE nexone_template RENAME TO nexone_template;`);
    
    console.log('Database renamed successfully!');
  } catch (error) {
    if (error.code === '3D000') {
      console.log('Database nexone_template does not exist (perhaps already renamed?)');
    } else {
      console.error('Error renaming database:', error);
    }
  } finally {
    await client.end();
  }
}

renameDatabase();
