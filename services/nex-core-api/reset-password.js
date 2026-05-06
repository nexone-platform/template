const { Client } = require('pg');
const crypto = require('crypto');

function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plain, salt, 100_000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function resetPassword() {
  const client = new Client({
    host: '203.151.66.51',
    port: 5434,
    user: 'postgres',
    password: 'qwerty',
    database: 'nexone_template',
  });
  
  try {
    await client.connect();
    
    const newHash = hashPassword('123456');
    console.log('New hash for "123456":', newHash.substring(0, 50) + '...');
    
    // Verify our own hash works
    const [salt, hash] = newHash.split(':');
    const verify = crypto.pbkdf2Sync('123456', salt, 100_000, 64, 'sha512').toString('hex');
    console.log('Self-verify:', verify === hash ? '✅ OK' : '❌ FAIL');
    
    // Update password + reset failed_login_count
    const result = await client.query(
      `UPDATE nex_core.users 
       SET password = $1, failed_login_count = 0, locked_until = NULL 
       WHERE email = 'tigerlinly@gmail.com'`,
      [newHash]
    );
    
    console.log(`Updated ${result.rowCount} user(s)`);
    console.log('✅ Password reset to "123456" for tigerlinly@gmail.com');
    console.log('✅ Failed login count reset to 0');
    
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}

resetPassword();
