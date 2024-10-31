const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Import User model

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists in the database
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // User exists, proceed with authentication
          return done(null, user);
        } else {
          // User doesn't exist, create a new one
          user = new User({
            googleId: profile.id,           // Storing the Google ID
            name: profile.displayName,
            email: profile.emails[0].value,
            password: null,                 // Google users won't have a password
            isVerified: true,               // Automatically verify Google users
            image: profile.photos[0].value, // Google profile image
          });

          await user.save();
          return done(null, user);
        }
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
