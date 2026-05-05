const crypto = require('crypto');
function hashPassword(plain) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(plain, salt, 100000, 64, 'sha512').toString('hex');
    return salt + ':' + hash;
}

const { Client } = require('pg');
const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

const newHash = hashPassword('password123');

client.connect().then(() => {
  return client.query("UPDATE nex_core.users SET password = $1 WHERE email = 'tigerlinly@gmail.com'", [newHash]);
}).then(res => {
  console.log("Updated rows:", res.rowCount);
  client.end();
}).catch(e => console.error(e));
