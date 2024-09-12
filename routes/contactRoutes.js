const express = require('express');
const { contactUs } = require('../controllers/contactUsController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Contact Us route
router.post('/contact-us', protect, contactUs);

module.exports = router;
