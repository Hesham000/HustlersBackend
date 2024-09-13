const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
    createCheckoutSession,
    createPayment,
    getPayments,
    getPaymentById,
    updatePaymentStatus,
} = require('../controllers/paymentController');

const router = express.Router();

// Create a Stripe Checkout session (redirect to Stripe payment page)
router.post('/create-checkout-session', protect, createCheckoutSession);

// Store payment after confirmation
router.post('/', protect, createPayment);

// Admin-only route to get all payments
router.get('/', protect, restrictTo('admin'), getPayments);

// Get a single payment by ID
router.get('/:id', protect, restrictTo('admin', 'user'), getPaymentById);

// Update payment status (admin)
router.put('/:id', protect, restrictTo('admin'), updatePaymentStatus);

module.exports = router;
