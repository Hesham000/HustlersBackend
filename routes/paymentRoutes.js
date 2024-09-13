// routes/paymentRoutes.js
const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
    createPaymentIntent,
    createPayment,
    getPayments,
    updatePaymentStatus,
} = require('../controllers/paymentController');

const router = express.Router();

// Create a Stripe payment intent
router.post('/create-payment-intent', protect, createPaymentIntent);

// Store payment after confirmation
router.post('/', protect, createPayment);

// Admin-only route to get all payments
router.get('/', protect, restrictTo('admin'), getPayments);

// Update payment status (admin)
router.put('/:id', protect, restrictTo('admin'), updatePaymentStatus);

module.exports = router;
