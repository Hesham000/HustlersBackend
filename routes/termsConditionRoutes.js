// routes/termsConditionRoutes.js
const express = require('express');
const { createTermsCondition, getTermsCondition, updateTermsCondition } = require('../controllers/termsConditionController');
const { protect } = require('../middleware/authMiddleware'); 

const router = express.Router();

// Routes for terms and conditions management
router.route('/')
    .post(protect, createTermsCondition)  // Create a new Terms and Conditions (protected)
    .get(getTermsCondition);              // Get the existing Terms and Conditions

router.route('/update')
    .put(protect, updateTermsCondition);  // Update the existing Terms and Conditions (protected)

module.exports = router;
