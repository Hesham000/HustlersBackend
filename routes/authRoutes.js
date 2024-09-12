const express = require('express');
const passport = require('passport');
const { 
    register, 
    verifyOtp, 
    login, 
    googleAuthCallback, 
    logout 
} = require('../controllers/authController');
const upload = require('../utils/multer'); // Import Multer for handling file uploads

const router = express.Router();

// Route to register a new user with optional image upload (file or Base64)
router.post('/register', (req, res, next) => {
    // Handle optional file upload with Multer
    upload.single('image')(req, res, (err) => {
        if (err) {
            // Handle Multer upload errors
            return res.status(400).json({
                success: false,
                error: 'Error uploading image. Please try again.'
            });
        }
        next(); // Continue to the controller if upload succeeds or no file is provided
    });
}, register);

// Route to verify OTP for email verification
router.post('/verify-otp', verifyOtp);  // Changed from verify-email to verify OTP

// Route to login the user with email and password
router.post('/login', login);

// Route to logout the user
router.post('/logout', logout);

// Google OAuth routes
router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback route after successful authentication
router.get('/google/callback', 
    passport.authenticate('google', { session: false }), 
    googleAuthCallback // Directly pass the callback function
);

// Route to get Google OAuth Client ID (useful for frontend integration)
router.get('/google-client-id', (req, res) => {
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID });
});

module.exports = router;
