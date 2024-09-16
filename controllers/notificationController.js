const Notification = require('../models/Notification');
const axios = require('axios');
const { getAccessToken } = require('../utils/firebaseAuth');

// FCM API URL for Firebase Cloud Messaging
const FCM_API_URL = process.env.FCM_API_URL;

/**
 * Send a notification to all users via FCM topic
 */
exports.sendNotificationToAll = async (req, res) => {
    const { title, body } = req.body;

    try {
        // Save the notification in MongoDB
        const notification = await Notification.create({ title, body });

        // Get an OAuth token for FCM using your Firebase service account
        const accessToken = await getAccessToken();

        // Create the FCM payload
        const payload = {
            message: {
                topic: 'all_users',
                notification: {
                    title,
                    body,
                },
            },
        };

        // Send the notification to FCM
        const response = await axios.post(FCM_API_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Notification sent to all users successfully',
            data: notification,
            fcmResponse: response.data,
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send notification',
        });
    }
};

/**
 * Send a notification to a specific user via FCM Token
 */
exports.sendNotificationToUser = async (req, res) => {
    const { title, body, fcmToken } = req.body; // fcmToken will be provided by the mobile app

    try {
        // Save the notification in MongoDB
        const notification = await Notification.create({ title, body, user: req.user.id });

        // Get an OAuth token for FCM using your Firebase service account
        const accessToken = await getAccessToken();

        // Create the FCM payload for the specific user
        const payload = {
            message: {
                token: fcmToken,
                notification: {
                    title,
                    body,
                },
            },
        };

        // Send the notification to FCM
        const response = await axios.post(FCM_API_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        res.status(200).json({
            success: true,
            message: `Notification sent to user with token: ${fcmToken}`,
            data: notification,
            fcmResponse: response.data,
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send notification',
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
