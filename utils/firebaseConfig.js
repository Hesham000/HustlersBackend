// utils/firebaseConfig.js
const admin = require('firebase-admin');
const serviceAccount = require('../path/to/serviceAccountKey.json'); // Firebase service account key file

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;