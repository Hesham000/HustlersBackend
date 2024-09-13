// routes/faqRoutes.js
const express = require('express');
const { addFAQ, getFAQs, updateFAQ, deleteFAQ } = require('../controllers/faqController');
const { protect } = require('../middleware/authMiddleware'); // Assuming you have a protect middleware

const router = express.Router();

// Routes for FAQ management
router.route('/')
    .post(protect, addFAQ)  // Create a new FAQ (protected)
    .get(getFAQs);          // Get all FAQs

router.route('/:id')
    .put(protect, updateFAQ)  // Update an FAQ (protected)
    .delete(protect, deleteFAQ); // Delete an FAQ (protected)

module.exports = router;
