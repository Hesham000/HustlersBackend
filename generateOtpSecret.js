const speakeasy = require('speakeasy');

// Generate a secret for OTP
const secret = speakeasy.generateSecret({ length: 20 });
console.log('Your OTP Secret:', secret.base32);