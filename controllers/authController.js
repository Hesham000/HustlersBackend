const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendVerificationOtp, generateOtp, verifyOtp } = require('../services/emailService');
const blacklist = require('../utils/blacklist');

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

// Helper function to convert image buffer to Base64
const convertImageToBase64 = (buffer) => {
    return buffer.toString('base64');
};

// Register User (with optional image upload)
exports.register = async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
        }

        let imageUrl = 'default-image-url'; // Default image URL if no image is uploaded
        if (req.file) {
            // Convert uploaded image to Base64 or store it in your cloud service
            imageUrl = `data:image/jpeg;base64,${convertImageToBase64(req.file.buffer)}`;
        }

        // Create the user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            image: imageUrl, // Save the image URL or Base64 string
            isVerified: false,
        });

        // Generate OTP and send it via email
        const otp = generateOtp();
        user.verificationOtp = otp;
        user.verificationExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
        await user.save();
        
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
        // Find the user by email
        const user = await User.findOne({ email });

        // Check if OTP is valid and not expired
        const isValidOtp = verifyOtp(otp, user.verificationOtp);
        if (!isValidOtp || Date.now() > user.verificationExpires) {
            return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
        }

        // Mark the user as verified
        user.isVerified = true;
        user.verificationOtp = undefined; // Clear OTP
        user.verificationExpires = undefined; // Clear OTP expiration
        await user.save();

        // Generate token
        const token = generateToken(user);

        // Return all the registered data with the response
        res.status(200).json({
            success: true,
            message: 'Email successfully verified. You are now logged in.',
            token: token,
            userData: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                image: user.image
            }
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

        // Generate token
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
