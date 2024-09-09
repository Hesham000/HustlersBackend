const express = require('express');
const { getAnalytics } = require('../controllers/analyticsController');
const { protect, restrictTo } = require('../middleware/authMiddleware'); // Assuming you have this middleware

const router = express.Router();

// Protect this route so that only admins can access analytics
router.get('/', protect, restrictTo('admin'), getAnalytics);

module.exports = router;