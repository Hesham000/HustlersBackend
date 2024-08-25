const express = require('express');
const passport = require('passport');
const { register, login, googleAuthCallback } = require('../controllers/authController');
const router = express.Router();

// Email/Password authentication routes
router.post('/register', register);
router.post('/login', login);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), googleAuthCallback);

module.exports = router;
