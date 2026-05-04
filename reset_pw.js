const crypto = require('crypto');
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.pbkdf2Sync('123456', salt, 100000, 64, 'sha512').toString('hex');
const full = salt + ':' + hash;
const { Client } = require('pg');
const c = new Client({user:'postgres',password:'qwerty',host:'203.151.66.51',port:5434,database:'nexone_template'});
c.connect().then(()=>c.query('UPDATE nex_core.users SET password=$1 WHERE email=$2', [full, 'admin@company.com'])).then(r=>{console.log('updated');c.end()}).catch(console.error);
