const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nex_tbiz'
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to nex_tbiz successfully!');
    await client.end();
  } catch (err) {
    console.error('Failed to connect to nex_tbiz:', err.message);
  }
}

run();
