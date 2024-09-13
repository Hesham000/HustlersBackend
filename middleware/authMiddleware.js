const jwt = require('jsonwebtoken');
const User = require('../models/User');
const blacklist = require('../utils/blacklist');

// Middleware to protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Check if token is blacklisted
            if (blacklist.has(token)) {
                return res.status(401).json({
                    success: false,
                    error: 'Token has been invalidated. Please log in again.',
                });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user by decoded token id
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found. Authentication failed.',
                });
            }

            // Check if user is active
            if (user.isActive === false) {
                return res.status(401).json({
                    success: false,
                    error: 'User account is deactivated. Please contact support.',
                });
            }

            // Attach user to request object
            req.user = user;
            next();
        } catch (err) {
            console.error('Authentication error:', err.message);

            let errorMessage = 'Not authorized, token failed.';
            if (err.name === 'TokenExpiredError') {
                errorMessage = 'Token expired, please log in again.';
            } else if (err.name === 'JsonWebTokenError') {
                errorMessage = 'Invalid token, please log in again.';
            }

            return res.status(401).json({
                success: false,
                error: errorMessage,
            });
        }
    } else {
        return res.status(401).json({
            success: false,
            error: 'Not authorized, no token provided.',
        });
    }
};

// Middleware to restrict routes based on roles
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to perform this action.',
            });
        }
        next();
    };
};
