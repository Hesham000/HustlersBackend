const admin = require('firebase-admin');

// Path to the serviceAccountKey.json secret file stored on Render
const serviceAccountPath = '/etc/secrets/serviceAccountKey.json';

try {
  // Initialize Firebase Admin SDK using the serviceAccountKey.json file
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
