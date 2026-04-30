const { Client } = require('pg');

const client = new Client({
  user: 'nexspeed',
  host: 'localhost',
  database: 'nexspeed_tms',
  password: 'nexspeed123',
  port: 5432,
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB');

    // 1. Add the order_seq column
    await client.query('ALTER TABLE nexspeed.system_apps ADD COLUMN IF NOT EXISTS order_seq INT DEFAULT 99;');
    console.log('Added order_seq column.');

    // 2. Set predefined order sequences matching seed_apps.sql
    const updates = [
      { id: 1, seq: 1 },
      { id: 2, seq: 2 },
      { id: 3, seq: 3 },
      { id: 4, seq: 4 },
      { id: 5, seq: 5 },
      { id: 6, seq: 6 },
      { id: 7, seq: 7 },
      { id: 8, seq: 8 },
      { id: 9, seq: 9 },
      { id: 10, seq: 10 },
      { id: 11, seq: 11 }
    ];

    for (const app of updates) {
      await client.query('UPDATE nexspeed.system_apps SET order_seq = $1 WHERE id = $2;', [app.seq, app.id]);
    }
    console.log('Updated predefined order sequences.');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

run();
