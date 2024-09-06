const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../services/emailService');
const blacklist = require('../utils/blacklist');

// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role }, // Include role in token payload
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// Register User (Email/Password)
exports.register = async (req, res) => {
    const { name, email, password, phone } = req.body; // Include phone

    try {
        // Create a new user but do not mark them as verified yet
        const user = await User.create({
            name,
            email,
            password,
            phone,  // Add phone number during registration
            isVerified: false,  // Field to track email verification
        });

        // Generate a verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Save the token in the user document
        user.verificationToken = verificationToken;
        user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // Token expires in 24 hours
        await user.save();

        // Send verification email
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
        await sendVerificationEmail(user.email, verificationUrl);

        res.status(200).json({
            success: true,
            message: 'Registration successful. Please check your email to verify your account.',
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const user = await User.findOne({
            verificationToken: token,
            verificationExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationExpires = undefined;
        await user.save();

        // Send back a token including the role
        const authToken = generateToken(user);

        res.status(200).json({
            success: true,
            message: 'Email successfully verified. You are now logged in.',
            token: authToken,  // Send token in response
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Login User (Email/Password)
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ success: false, error: 'Email not verified' });
        }

        // Generate token including the role
        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,  // Include phone number in response
                role: user.role,  // Include role
                token: generateToken(user),
            },
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Logout User
exports.logout = (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];

        // Add token to blacklist to invalidate it
        blacklist.add(token);

        res.status(200).json({
            success: true,
            message: "User logged out successfully. Token invalidated.",
        });
    } catch (err) {
        res.status(400).json({ success: false, error: 'Failed to logout. Please try again.' });
    }
};

// Google OAuth callback
exports.googleAuthCallback = (req, res) => {
    if (req.user && req.user.token) {
        res.redirect(`http://localhost:3000?token=${req.user.token}`);
    } else {
        res.status(401).json({ success: false, error: 'Google authentication failed' });
    }
};
