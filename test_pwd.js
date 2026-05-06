const crypto = require('crypto');
const plain = '123456';
const stored = '2e4b6b16069ba9b726ed964de5c7216b:e0b9bfb39bbb30719a44a9f2d46f32cfb48285df5ccfe95ae6f2e4fdcf1a0ecd1c2065638f476a53a4d945f1376be3c709ae039097d438c4b04cc5bb22f9e3fb';
const [salt, hash] = stored.split(':');
const test = crypto.pbkdf2Sync(plain, salt, 100_000, 64, 'sha512').toString('hex');
console.log('Does password match?', test === hash);
