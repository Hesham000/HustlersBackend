// firebaseAuth.js
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK using the service account key
admin.initializeApp({
    credential: admin.credential.cert(path.resolve(__dirname, '../serviceAccountKey.json')),
});

/**
 * Get an OAuth2 access token from Firebase for sending FCM notifications.
 * This access token will be used to authenticate FCM requests.
 */
const getAccessToken = async () => {
    try {
        const token = await admin.credential.applicationDefault().getAccessToken();
        return token.access_token;
    } catch (error) {
        console.error('Error getting access token:', error.message);
        throw new Error('Failed to retrieve access token for FCM');
    }
};

module.exports = {
    getAccessToken,
};
