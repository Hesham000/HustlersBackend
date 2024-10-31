const express = require('express');
const passport = require('passport');
const { register, verifyOtp, login, logout, googleAuthCallback, requestPasswordReset, resetPassword, verifyUser,suspendUser,unsuspendUser } = require('../controllers/authController');
const upload = require('../utils/multer');

const router = express.Router();

// Route to register a new user with optional image upload
router.post('/register', upload.single('image'), register);

// Other auth routes
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/logout', logout);


// Routes for password reset
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route to handle the callback from Google OAuth
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }), 
  googleAuthCallback // This will handle the JWT token generation and response
);



module.exports = router;
