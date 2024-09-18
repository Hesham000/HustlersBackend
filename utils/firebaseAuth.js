// firebaseAuth.js
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');
const { google } = require('googleapis');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Function to get the access token
const getAccessToken = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  });

  const authToken = await auth.getAccessToken();
  return authToken.token;
};

module.exports = {
  admin,
  getAccessToken,
};
