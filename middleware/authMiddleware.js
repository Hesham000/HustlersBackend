const jwt = require('jsonwebtoken');
const User = require('../models/User');
const blacklist = require('../utils/blacklist');

exports.protect = async (req, res, next) => {
    let token;

    // Check if the authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from the header
            token = req.headers.authorization.split(' ')[1];

            // Check if the token is blacklisted (invalidated)
            if (blacklist.has(token)) {
                return res.status(401).json({
                    success: false,
                    error: 'Token has been invalidated. Please log in again.',
                });
            }

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user based on the decoded token ID
            const user = await User.findById(decoded.id);

            // Check if user exists
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found. Authentication failed.',
                });
            }

            // Check if the user's account is active
            if (user.isActive === false) { // Assuming `isActive` is a boolean field
                return res.status(401).json({
                    success: false,
                    error: 'User account is deactivated. Please contact support.',
                });
            }

            // Attach user to the request object for access in subsequent middleware
            req.user = user;

            // User is authenticated, proceed to the next middleware
            next();
        } catch (err) {
            console.error('Authentication error:', err.message);

            let errorMessage = 'Not authorized, token failed.';

            // Handle specific JWT errors
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
        // No token provided in the authorization header
        return res.status(401).json({
            success: false,
            error: 'Not authorized, no token provided.',
        });
    }
};


// Middleware to restrict access to certain roles
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // Check if the user's role is allowed to access the route
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to perform this action.',
            });
        }
        next();
    };
};
