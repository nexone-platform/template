const { Client } = require('pg');
const crypto = require('crypto');

function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plain, salt, 100_000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

async function main() {
  await client.connect();

  const hashedPw = hashPassword('Password123!');

  await client.query(`
    INSERT INTO nex_core.users (
      id, email, password, display_name, role_id, role_name, app_access, is_active, create_by
    ) VALUES (
      gen_random_uuid(), 'admin@company.com', $1, 'Admin User', 1, 'admin', '["nex-core", "nex-speed"]', true, 'system'
    ) ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;
  `, [hashedPw]);

  await client.query(`
    INSERT INTO nex_core.users (
      id, email, password, display_name, role_id, role_name, app_access, is_active, create_by
    ) VALUES (
      gen_random_uuid(), 'user@company.com', $1, 'Normal User', 2, 'user', '["nex-speed"]', true, 'system'
    ) ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;
  `, [hashedPw]);

  console.log('Users inserted successfully');
  await client.end();
}

main().catch(console.error);
