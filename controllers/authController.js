const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Register User (Email/Password)
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const user = await User.create({ name, email, password });
        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            },
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

        if (user && (await user.matchPassword(password))) {
            res.status(200).json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    token: generateToken(user._id),
                },
            });
        } else {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Google OAuth callback
exports.googleAuthCallback = (req, res) => {
    if (req.user) {
        // Send the JWT token to the client
        res.redirect(`http://localhost:3000?token=${req.user.token}`);
    } else {
        res.status(401).json({ success: false, error: 'Google authentication failed' });
    }
};
