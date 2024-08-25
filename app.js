const express = require('express');
const dotenv = require('dotenv');
const passport = require('passport');
const connectDB = require('./config/db');
const errorHandler = require('./utils/errorHandler');
const helmet = require('helmet');

// Load environment variables
dotenv.config();

// Log environment variables to confirm they are loaded
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);

// Connect to the database
connectDB();

// Initialize Express
const app = express();

// Middleware to serve images from the "uploads" directory
app.use('/uploads', express.static('uploads'));

// Body parser middleware to parse JSON request bodies
app.use(express.json());

// Middleware to set security headers
app.use(helmet());

// Initialize Passport middleware for authentication
app.use(passport.initialize());

// Load Passport configuration (e.g., strategies)
require('./config/passport');

// Route files
const authRoutes = require('./routes/authRoutes');
const packageRoutes = require('./routes/packageRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Mount routers to handle specific routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Export the Express app for use in other files (e.g., for server.js or testing)
module.exports = app;
