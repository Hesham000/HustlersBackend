const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationsController');

// Create notification
router.post('/', notificationController.createNotification);

// Get all notifications
router.get('/', notificationController.getNotifications);

// Update a notification
router.put('/:id', notificationController.updateNotification);

// Delete a notification
router.delete('/:id', notificationController.deleteNotification);

// Send notification to all users
router.post('/send/all', notificationController.sendNotificationToAll);

// Send notification to a specific user
router.post('/send/:userId', notificationController.sendNotificationToUser);

module.exports = router;
