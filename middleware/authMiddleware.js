const jwt = require('jsonwebtoken');
const User = require('../models/User');
const blacklist = require('../utils/blacklist');

// Middleware to protect routes by checking token
exports.protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]; // Extract token

            // Check if token is blacklisted (logged out or revoked)
            if (blacklist.has(token)) {
                return res.status(401).json({
                    success: false,
                    error: 'Token has been invalidated. Please log in again.',
                });
            }

            // Verify JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find user by decoded token ID
            const user = await User.findById(decoded.id);

            // If no user found, return authentication failure
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found. Authentication failed.',
                });
            }

            // Check if the user is deactivated
            if (user.isActive === false) {
                return res.status(401).json({
                    success: false,
                    error: 'User account is deactivated. Please contact support.',
                });
            }

            // Attach user to request object for further access
            req.user = user;
            next(); // Proceed to the next middleware/controller
        } catch (err) {
            console.error('Authentication error:', err.message);

            // Handle different JWT errors
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
        // If no token provided
        return res.status(401).json({
            success: false,
            error: 'Not authorized, no token provided.',
        });
    }
};

// Middleware to restrict access to specific roles
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // Check if user role is in the allowed roles
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to perform this action.',
            });
        }
        next(); // Proceed if authorized
    };
};
