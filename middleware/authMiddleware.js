const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    // Check if the token exists in the authorization header and starts with "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token from the authorization header
            token = req.headers.authorization.split(' ')[1];

            // Decode the token using the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user based on the ID in the decoded token
            req.user = await User.findById(decoded.id);

            // Check if the user still exists
            if (!req.user) {
                return res.status(401).json({ success: false, error: 'User not found' });
            }

            // If everything is okay, proceed to the next middleware
            next();
        } catch (err) {
            console.error(err);  // Log the error for debugging
            return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
        }
    }

    // If no token was found, return an error
    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized, no token' });
    }
};
