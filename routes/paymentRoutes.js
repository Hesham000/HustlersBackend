const express = require('express');
const {
    createPaymentIntent,
    createPayment,
    getPayments,
    getPaymentById,
    updatePaymentStatus
} = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();

// Create a Stripe payment intent
router.post('/create-payment-intent', protect, createPaymentIntent); // Create Stripe payment intent

// Payment CRUD operations
router.post('/', protect, createPayment); // Store payment in the database
router.get('/', protect, restrictTo('admin'), getPayments); // Get all payments (admin)
router.get('/:id', protect, restrictTo('admin', 'user'), getPaymentById); // Get a specific payment by ID
router.put('/:id', protect, restrictTo('admin'), updatePaymentStatus); // Update payment status (admin)

module.exports = router;
