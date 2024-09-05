const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Load environment variables
require('dotenv').config();

// Helper function to generate JWT token
const generateJwtToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '30d' } // Token expires in 30 days
    );
};

// Configure the Google OAuth strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
                    return done(null, { user, token });
                }

                user = await User.create({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    isVerified: true,
                });

                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
                return done(null, { user, token });
            } catch (err) {
                return done(err, false);
            }
        }
    )
);


// Serialize user information into the session
passport.serializeUser((data, done) => {
    done(null, data);
});

// Deserialize user information from the session
passport.deserializeUser((obj, done) => {
    done(null, obj);
});

module.exports = passport;
