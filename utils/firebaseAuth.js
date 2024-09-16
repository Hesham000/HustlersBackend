const admin = require('firebase-admin');
const path = require('path');

// Path to your Firebase service account key
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

// Initialize Firebase Admin SDK with the service account key
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount), // Use the service account key
});

/**
 * Function to get access token for FCM
 */
const getAccessToken = async () => {
    try {
        const accessToken = await admin.credential.cert(serviceAccount).getAccessToken();
        return accessToken.access_token;
    } catch (error) {
        console.error('Error getting Firebase access token:', error);
        throw new Error('Failed to get Firebase access token');
    }
};

module.exports = {
    getAccessToken,
};
