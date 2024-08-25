const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Load environment variables
require('dotenv').config();

// Configure the Google strategy for use by Passport.
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,         // Your Google Client ID
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Your Google Client Secret
    callbackURL: '/api/auth/google/callback',       // Callback URL after Google authentication
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Look for an existing user with the Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            // If the user doesn't exist, create a new one
            user = await User.create({
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
            });
        }

        // Generate a JWT token for the authenticated user
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        // Pass the user and token to the done callback
        return done(null, { user, token });
    } catch (err) {
        // Handle errors during the authentication process
        return done(err, false);
    }
}));

// Serialize user information into the session
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user information from the session
passport.deserializeUser((obj, done) => {
    done(null, obj);
});
