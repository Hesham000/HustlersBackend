const express = require('express');
const {
  createPayment,
  getPayments,
  getPaymentById,
  handleStripeWebhook
} = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/authMiddleware'); // Use protect and restrictTo

const router = express.Router();

// Route to create a payment
router.post('/create', protect, createPayment);

// Route to get all payments for the authenticated user
router.get('/', protect, getPayments);

// Route to get a specific payment by ID for the authenticated user
router.get('/:paymentId', protect, getPaymentById);

// Webhook for Stripe to update payment status (no auth required for webhooks)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Optionally, you can restrict certain routes to admin users or specific roles.
// Example: Admin can view all users' payments or cancel payments.
router.get('/admin/all-payments', protect, restrictTo('admin'), (req, res) => {
  // Admin route logic here
});

module.exports = router;
