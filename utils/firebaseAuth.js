const admin = require('firebase-admin');
const path = require('path');

// Path to the serviceAccountKey.json secret file
const serviceAccountPath = '/etc/secrets/serviceAccountKey.json';

// Initialize Firebase Admin SDK using the serviceAccountKey.json file
try {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error.message);
}

module.exports = {
  admin,
};
