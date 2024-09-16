// routes/notificationRoutes.js
const express = require('express');
const {
    sendNotificationToAll,
    sendNotificationToUser,
    getAllNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification,
} = require('../controllers/notificationController');
const { protect, restrictTo } = require('../middleware/authMiddleware'); // Middleware for authentication and role restriction

const router = express.Router();

// Routes for notifications

// POST: Send a notification to all users
router.post('/send/all', protect, restrictTo('admin'), sendNotificationToAll);

// POST: Send a notification to a specific user via FCM token
router.post('/send/user', protect, restrictTo('admin'), sendNotificationToUser);

// GET: Get all notifications
router.get('/', protect, getAllNotifications);

// GET: Get a specific notification by ID
router.get('/:id', protect, getNotificationById);

// PUT: Update a notification by ID
router.put('/:id', protect, restrictTo('admin'), updateNotification);

// DELETE: Delete a notification by ID
router.delete('/:id', protect, restrictTo('admin'), deleteNotification);

module.exports = router;