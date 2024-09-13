const express = require('express');
const { contactUs, getAllInquiries } = require('../controllers/contactUsController'); 
const { protect, restrictTo } = require('../middleware/authMiddleware'); // Added 'restrictTo' for role-based access

const router = express.Router();

// POST: Contact Us route (open to all authenticated users)
router.post('/contact-us', protect, contactUs);

// GET: Get all inquiries (restricted to 'admin' role)
router.get('/inquiries', protect, restrictTo('admin'), getAllInquiries);

module.exports = router;
