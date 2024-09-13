const express = require('express');
const { register, verifyOtp, login, logout, googleAuthCallback } = require('../controllers/authController');
const upload = require('../utils/multer'); // Multer for file uploads

const router = express.Router();

// Route to register a new user with optional image upload
router.post('/register', upload.single('image'), register);

// Other auth routes...
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;
