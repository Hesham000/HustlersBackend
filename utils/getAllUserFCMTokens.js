const User = require('../models/User'); // Assuming User model is in the models directory

/**
 * Helper function to get all FCM tokens from users
 */
const getAllUserFCMTokens = async () => {
    try {
        // Find users who have an FCM token
        const users = await User.find({ fcmToken: { $exists: true, $ne: null } }).select('fcmToken');
        const fcmTokens = users.map(user => user.fcmToken); // Map to extract only the FCM tokens
        return fcmTokens;
    } catch (error) {
        console.error('Error fetching FCM tokens:', error);
        throw new Error('Failed to retrieve FCM tokens');
    }
};

module.exports = getAllUserFCMTokens;
