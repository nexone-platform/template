const { Client } = require('pg');
const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

client.connect()
  .then(() => {
    return client.query(`
      ALTER TABLE nex_core.users ADD COLUMN IF NOT EXISTS failed_login_count integer DEFAULT 0;
      ALTER TABLE nex_core.users ADD COLUMN IF NOT EXISTS locked_until timestamp;

      CREATE TABLE IF NOT EXISTS nex_core.sessions (
          id varchar(128) PRIMARY KEY,
          user_id uuid NOT NULL,
          ip_address varchar(45),
          user_agent text,
          device_name varchar(100),
          is_active boolean DEFAULT true,
          expires_at timestamp NOT NULL,
          created_at timestamp DEFAULT now(),
          last_activity_at timestamp DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON nex_core.sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires ON nex_core.sessions(expires_at);
    `);
    client.end();
  })
  .catch(err => {
    console.error('Error updating schema:', err);
    client.end();
  });
