const express = require('express');
const passport = require('passport');
const { 
    register, 
    verifyEmail, 
    login, 
    googleAuthCallback, 
    logout 
} = require('../controllers/authController');
const { upload } = require('../utils/cloudinary');  // Import Multer for handling image uploads
const router = express.Router();

// Route to register a new user with image upload
router.post('/register', upload.single('image'), register);

// Route to verify email (using the verification token)
router.get('/verify-email/:token', verifyEmail);

// Route to login the user
router.post('/login', login);

// Route to logout the user
router.post('/logout', logout);

// Google OAuth routes
router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
    passport.authenticate('google', { session: false }), 
    googleAuthCallback // Pass the callback directly without extra function
);

// Route to get Google OAuth Client ID
router.get('/google-client-id', (req, res) => {
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID });
});

module.exports = router;
