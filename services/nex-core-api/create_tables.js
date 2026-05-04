const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

async function main() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS nex_core.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      display_name VARCHAR(100),
      role_id INT DEFAULT 2,
      role_name VARCHAR(50) DEFAULT 'user',
      is_active BOOLEAN DEFAULT true,
      employee_id VARCHAR(50),
      avatar_url VARCHAR(500),
      app_access TEXT,
      last_login_at TIMESTAMP,
      failed_login_count INT DEFAULT 0,
      locked_until TIMESTAMP,
      create_date TIMESTAMP DEFAULT now(),
      create_by VARCHAR(50),
      update_date TIMESTAMP DEFAULT now(),
      update_by VARCHAR(50)
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS nex_core.sessions (
      id VARCHAR(128) PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES nex_core.users(id) ON DELETE CASCADE,
      ip_address VARCHAR(45),
      user_agent TEXT,
      device_name VARCHAR(100),
      is_active BOOLEAN DEFAULT true,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT now(),
      last_activity_at TIMESTAMP DEFAULT now()
    );
  `);

  console.log('Tables recreated successfully');
  await client.end();
}

main().catch(console.error);
