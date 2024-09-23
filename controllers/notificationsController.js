const Notification = require('../models/Notification');
const User = require('../models/User');
const { admin } = require('../utils/firebaseAuth');

// Create a notification and save to MongoDB
exports.createNotification = async (req, res) => {
  try {
    const { title, body } = req.body;
    const notification = new Notification({ title, body });
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notification', details: error.message });
  }
};

// Send notification to all users
exports.sendNotificationToAll = async (req, res) => {
  try {
    const users = await User.find({ fcmToken: { $exists: true, $ne: null } });
    const fcmTokens = users.map(user => user.fcmToken);

    const { title, body } = req.body;

    // Construct the message payload
    const message = {
      notification: {
        title,
        body,
      },
      tokens: fcmTokens, // Array of FCM tokens
    };

    // Send notification via Firebase Admin SDK
    const response = await admin.messaging().sendMulticast(message);
    console.log('FCM response:', response);

    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error('Failed to send notifications:', error.message);
    res.status(500).json({ error: 'Failed to send notifications to all users', details: error.message });
  }
};

// Send notification to a specific user by FCM token
exports.sendNotificationToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user || !user.fcmToken) {
      return res.status(404).json({ error: 'User not found or has no FCM token' });
    }

    const { title, body } = req.body;

    // Construct the message payload
    const message = {
      notification: {
        title,
        body,
      },
      token: user.fcmToken, // Send to individual token
    };

    // Send notification via Firebase Admin SDK
    const response = await admin.messaging().send(message);
    console.log('FCM response:', response);

    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error('Failed to send notification:', error.message);
    res.status(500).json({ error: 'Failed to send notification to user', details: error.message });
  }
};

// Get all notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get notifications', details: error.message });
  }
};

// Edit a notification
exports.updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body } = req.body;

    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { title, body },
      { new: true }
    );

    res.status(200).json(updatedNotification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification', details: error.message });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification', details: error.message });
  }
};
