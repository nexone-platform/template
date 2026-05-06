const { Client } = require('pg');
const crypto = require('crypto');

function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plain, salt, 100_000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function run() {
  const client = new Client({
    host: '203.151.66.51',
    port: 5434,
    user: 'postgres',
    password: 'qwerty',
    database: 'nexone_template',
  });

  try {
    await client.connect();
    
    const newPass = hashPassword('P@ssw0rd123!');
    const roleId = 'b98e5310-d1f6-4adf-9b3a-ed310c365c6b'; // Super Admin

    const query = `
      INSERT INTO nex_core.users (
        id, email, password, display_name, role_id, is_active, 
        timezone, language, create_date
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, true,
        'Asia/Bangkok', 'TH', NOW()
      ) ON CONFLICT (email) DO UPDATE SET password = $2
      RETURNING id, email
    `;

    const result = await client.query(query, ['admin@company.com', newPass, 'Master Admin', roleId]);
    console.log('Admin user created/updated:', JSON.stringify(result.rows, null, 2));

  } catch (err) {
    console.error('DB Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
