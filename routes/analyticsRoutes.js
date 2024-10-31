const express = require('express');
const { getAnalytics } = require('../controllers/analyticsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to get analytics data
// Only admins should have access to analytics, so we'll restrict this route
router.get('/', protect, restrictTo('admin'), getAnalytics);

module.exports = router;
