// authRoutes.js
const express = require('express');
const { register, verifyOtp, login, logout, googleAuthCallback, requestPasswordReset, resetPassword } = require('../controllers/authController');
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

module.exports = router;
