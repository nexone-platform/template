const crypto = require('crypto');

function verifyPassword(plain, stored) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const test = crypto.pbkdf2Sync(plain, salt, 100_000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(test, 'hex'));
}

const stored = "7b0dae228f593e0339b8d77a86a833a9:c6e89f9753c1e67c34352f068e1785ff6248f95406a8027c9a6e79a9185c7061bf1fd10a4f0f35622535fa8e12cd95bbb02912cea016416469085922b4d98170";

console.log("P@ssw0rd123!:", verifyPassword("P@ssw0rd123!", stored));
console.log("123456:", verifyPassword("123456", stored));
