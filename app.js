const express = require('express');
const dotenv = require('dotenv');
const passport = require('passport');
const connectDB = require('./config/db');
const errorHandler = require('./utils/errorHandler');
const helmet = require('helmet');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

// Log environment variables to confirm they are loaded (only for development)
if (process.env.NODE_ENV === 'development') {
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
    console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
}

// Connect to the database
connectDB();

// Initialize Express
const app = express();

// Enable CORS with options to allow requests from the frontend
// app.use(cors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Use FRONTEND_URL from env or fallback to localhost
//     credentials: true, // Allow cookies to be sent with requests
// }));
app.use(cors({
    origin: '*', // Allow requests from any origin
    credentials: true,
}));
// Middleware to serve static files from the "uploads" directory
app.use('/uploads', express.static('uploads'));

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to set security-related HTTP headers
app.use(helmet());

// Initialize Passport middleware for authentication
app.use(passport.initialize());

// Load Passport configuration (strategies and serialization)
require('./config/passport');

// Route files
const authRoutes = require('./routes/authRoutes');
const packageRoutes = require('./routes/packageRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const contactRoutes = require('./routes/contactRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const privacyPolicyRoutes = require('./routes/privacyPolicyRoutes');
const termsConditionRoutes = require('./routes/termsConditionRoutes');
const faqRoutes = require('./routes/faqRoutes');


// Mount routers to handle specific routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/privacy-policy', privacyPolicyRoutes);
app.use('/api/terms-condition', termsConditionRoutes);
app.use('/api/faqs', faqRoutes);
// Custom error handling middleware (must be last)
app.use(errorHandler);

// Export the Express app for use in other files (e.g., for server.js or testing)
module.exports = app;
