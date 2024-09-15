const express = require('express');
const { 
    createPrivacyPolicy, 
    getPrivacyPolicy, 
    getAllPrivacyPolicies, 
    updatePrivacyPolicy 
} = require('../controllers/privacyPolicyController');

const router = express.Router();

// Create a new privacy policy
router.post('/', createPrivacyPolicy);

// Get a single privacy policy
router.get('/', getAllPrivacyPolicies);

// Get all privacy policies
router.get('/:id',getPrivacyPolicy);

// Update the privacy policy
router.put('/', updatePrivacyPolicy);

module.exports = router;
