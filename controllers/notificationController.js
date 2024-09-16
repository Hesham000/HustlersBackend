const Notification = require('../models/Notifications');
const axios = require('axios');
const { getAccessToken } = require('../utils/firebaseAuth');
const getAllUserFCMTokens = require('../utils/getAllUserFCMTokens');

// FCM API URL for Firebase Cloud Messaging
const FCM_API_URL = process.env.FCM_API_URL;

/**

/**
 * Send a notification to all users via FCM topic
 */

exports.sendNotificationToAll = async (req, res) => {
    const { title, body } = req.body;

    try {
        // Get all user FCM tokens from the helper function
        const allFCMTokens = await getAllUserFCMTokens();

        if (!allFCMTokens || allFCMTokens.length === 0) {
            return res.status(400).json({ message: 'No FCM tokens found to send notifications' });
        }

        const accessToken = await getAccessToken();

        // Build the FCM message payload
        const message = {
            message: {
                notification: {
                    title: title,
                    body: body
                },
                tokens: allFCMTokens, // Use the array of tokens for multicast
            }
        };

        // Send the HTTP request to the FCM API
        const response = await axios.post(FCM_API_URL, message, {
            headers: {
                Authorization: `Bearer ${accessToken}`, // OAuth 2.0 token
                'Content-Type': 'application/json'
            }
        });

        // Create notification record in MongoDB
        const notification = new Notification({
            title,
            body,
            recipient: 'all',
            sent: true,
        });

        await notification.save();

        res.status(200).json({
            message: 'Notification sent to all users successfully via FCM API',
            response: response.data,
        });
    } catch (error) {
        console.error('Error sending notification to all users:', error);
        res.status(500).json({
            message: 'Failed to send notification to all users via FCM API',
            error: error.message,
        });
    }
};

/**
 * Send notification to a specific user via FCM REST API
 */
exports.sendNotificationToUser = async (req, res) => {
    const { title, body, fcmToken } = req.body;

    try {
        if (!fcmToken) {
            return res.status(400).json({ message: 'FCM Token is required for sending to a specific user' });
        }

        const accessToken = await getAccessToken();

        // Build the FCM message payload
        const message = {
            message: {
                notification: {
                    title: title,
                    body: body,
                },
                token: fcmToken, // Single user's FCM token
            }
        };

        // Send the HTTP request to the FCM API
        const response = await axios.post(FCM_API_URL, message, {
            headers: {
                Authorization: `Bearer ${accessToken}`, // Use the OAuth 2.0 token
                'Content-Type': 'application/json',
            }
        });

        // Save the notification in MongoDB
        const notification = new Notification({
            title,
            body,
            recipient: 'user', // Replace with actual user ID if available
            fcmToken,
            sent: true,
        });

        await notification.save();

        res.status(200).json({
            message: 'Notification sent to the user successfully via FCM API',
            response: response.data,
        });
    } catch (error) {
        console.error('Error sending notification to user via FCM API:', error);
        res.status(500).json({
            message: 'Failed to send notification to the user via FCM API',
            error: error.message,
        });
    }
};


/**
 * Get all notifications
 */
exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch notifications',
        });
    }
};

/**
 * Get a specific notification by ID
 */
exports.getNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found',
            });
        }

        res.status(200).json({
            success: true,
            data: notification,
        });
    } catch (error) {
        console.error('Error fetching notification:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch notification',
        });
    }
};

/**
 * Update a notification by ID
 */
exports.updateNotification = async (req, res) => {
    const { title, body } = req.body;

    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { title, body },
            { new: true, runValidators: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found',
            });
        }

        res.status(200).json({
            success: true,
            data: notification,
        });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update notification',
        });
    }
};

/**
 * Delete a notification by ID
 */
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete notification',
        });
    }
};
