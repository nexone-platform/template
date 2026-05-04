const { Client } = require('pg');
const crypto = require('crypto');

function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plain, salt, 100_000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

const newPassword = hashPassword('P@ssw0rd123!');
console.log('New password hash:', newPassword.substring(0, 50) + '...');

const c = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

c.connect()
  .then(() => c.query("UPDATE nex_core.users SET password = $1, failed_login_count = 0, locked_until = NULL WHERE email = 'admin@company.com' RETURNING id, email", [newPassword]))
  .then(r => {
    if (r.rowCount > 0) {
      console.log('Password reset for:', r.rows[0].email);
    } else {
      console.log('No user found with that email');
    }
    c.end();
  })
  .catch(e => { console.error(e.message); c.end(); });
