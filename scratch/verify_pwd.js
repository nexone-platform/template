
const crypto = require('crypto');
const stored = "dbeabdde3bc0cadda0b4642cafaed940:2db500e41f1935f3750a3cf044c6216bb920f679249157db48df735597e6685ecbae08db57d8ce64f8034a02216fd248e91ed21cc467ad331dcb12d12f4a9ede";
const plain = "123456";

const [salt, hash] = stored.split(':');
const test = crypto.pbkdf2Sync(plain, salt, 100_000, 64, 'sha512').toString('hex');
console.log("Matches:", hash === test);
