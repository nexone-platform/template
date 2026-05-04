const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'postgres'
});

async function listDatabases() {
  try {
    await client.connect();
    const res = await client.query(`SELECT datname FROM pg_database WHERE datistemplate = false;`);
    console.log(res.rows.map(row => row.datname));
  } finally {
    await client.end();
  }
}

listDatabases();
