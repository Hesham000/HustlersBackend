const express = require('express');
const dotenv = require('dotenv');
const passport = require('passport');
const connectDB = require('./config/db');
const errorHandler = require('./utils/errorHandler');
const helmet = require('helmet');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

// Initialize Express
const app = express();

// CORS configuration
const allowedOrigins = [
    'http://localhost:3000', // Frontend origin
    'null' // Allow local file system requests
  ];
  
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., from local file system) or from an allowed origin
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));
// Serve static files from the "uploads" directory
app.use('/uploads', express.static('uploads'));

// Parse JSON request bodies
app.use(express.json());

// Helmet security settings (adjusted for Stripe)
app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "script-src": ["'self'", "https://js.stripe.com"],
            "frame-src": ["'self'", "https://js.stripe.com"],
            "img-src": ["'self'", "https://*.stripe.com"],
            "connect-src": ["'self'", "https://api.stripe.com"]
        }
    },
    crossOriginEmbedderPolicy: false, // Disable COEP to avoid embedding issues
}));

// Initialize Passport for authentication
app.use(passport.initialize());
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
const stripeWebhook = require('./routes/stripeWebhook');
const notificationRoutes = require('./routes/notificationRoutes');
const orderRoutes = require('./routes/orderRoutes');
const calendlyRoutes = require('./routes/calendlyRoutes');

// Mount routers
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
app.use('/api/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
app.use('/api/notifications', notificationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/calendly', calendlyRoutes);

// Custom error handling
app.use(errorHandler);

// Export the Express app
module.exports = app;
