const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendVerificationOtp, generateOtp } = require('../services/emailService');
const blacklist = require('../utils/blacklist');
const { cloudinary } = require('../utils/cloudinary');

// Helper function to generate JWT token
const generateToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT Secret is not defined');
    }

    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// Register User (Email/Password + Image Upload + OTP)
exports.register = async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
        }

        // Handle image upload
        let imageUrl = 'default-image-url'; // Fallback image URL if no image is uploaded
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'user_images',
                use_filename: true,
                unique_filename: false,
                overwrite: true
            });
            imageUrl = result.secure_url;
        }

        // Create the user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            image: imageUrl,
            isVerified: false, 
        });

        // Generate OTP
        const otp = generateOtp();

        // Save OTP and its expiration in the user document
        user.verificationOtp = otp;
        user.verificationExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
        await user.save();

        // Send OTP via email
        await sendVerificationOtp(user.email, otp);

        res.status(200).json({
            success: true,
            message: 'Registration successful. Please check your email for the OTP to verify your account.',
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Find user by email and check if OTP matches and is not expired
        const user = await User.findOne({
            email,
            verificationOtp: otp,
            verificationExpires: { $gt: Date.now() }, // Check OTP expiration
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.verificationOtp = undefined; // Clear OTP
        user.verificationExpires = undefined; // Clear OTP expiration
        await user.save();

        // Send back a token including the role
        const authToken = generateToken(user);

        res.status(200).json({
            success: true,
            message: 'Email successfully verified. You are now logged in.',
            token: authToken,
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Login User (Email/Password)
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password'); // Explicitly select password

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ success: false, error: 'Email not verified. Please verify your email.' });
        }

        // Generate token including the role
        const token = generateToken(user);

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token,
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

        if (!token) {
            return res.status(400).json({ success: false, error: 'No token provided' });
        }

        // Add token to blacklist to invalidate it
        blacklist.add(token);

        res.status(200).json({
            success: true,
            message: 'User logged out successfully. Token invalidated.',
        });
    } catch (err) {
        res.status(400).json({ success: false, error: 'Failed to logout. Please try again.' });
    }
};

// Google OAuth callback
exports.googleAuthCallback = (req, res) => {
    if (req.user && req.user.token) {
        const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000'; // Use the frontend URL from env
        res.redirect(`${redirectUrl}?token=${req.user.token}`);
    } else {
        res.status(401).json({ success: false, error: 'Google authentication failed' });
    }
};
