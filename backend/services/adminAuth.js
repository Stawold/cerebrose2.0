const crypto = require('crypto');

// Constant-time comparison so a wrong guess can't be brute-forced faster
// by timing how quickly the server rejects it.
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function verifyAdminPassword(candidate) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false; // no password configured server-side => admin tools stay closed
  return safeEqual(candidate || '', expected);
}

module.exports = { verifyAdminPassword };
