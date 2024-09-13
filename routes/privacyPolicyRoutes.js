// routes/privacyPolicyRoutes.js
const express = require('express');
const { createPrivacyPolicy, getPrivacyPolicy, updatePrivacyPolicy } = require('../controllers/privacyPolicyController');
const { protect } = require('../middleware/authMiddleware'); // Assuming you have a protect middleware to restrict access

const router = express.Router();

// Routes for privacy policy management
router.route('/')
    .post(protect, createPrivacyPolicy)  // Create a new privacy policy
    .get(getPrivacyPolicy)               // Get the existing privacy policy

router.route('/update')
    .put(protect, updatePrivacyPolicy);   // Update the existing privacy policy

module.exports = router;
