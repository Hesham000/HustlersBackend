// webhookController.js
require('dotenv').config();  // Load environment variables

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);  // Stripe instance
const Payment = require('../models/Payment');  // Payment model

/**
 * Handle Stripe webhook events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;  // Your webhook secret from Stripe dashboard

  let event;

  try {
    // Construct the event from the raw body and Stripe signature
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      await updatePaymentStatus(paymentIntentSucceeded.id, 'completed');
      break;
    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object;
      await updatePaymentStatus(paymentIntentFailed.id, 'failed');
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
};

/**
 * Update payment status in the database based on Stripe's payment intent ID
 * @param {string} transactionId - Stripe's payment intent ID
 * @param {string} status - The new status of the payment (e.g., completed, failed)
 */
const updatePaymentStatus = async (transactionId, status) => {
  try {
    await Payment.findOneAndUpdate({ transactionId }, { status });
    console.log(`Payment status updated to ${status} for transaction ID: ${transactionId}`);
  } catch (error) {
    console.error(`Error updating payment status: ${error.message}`);
  }
};

module.exports = { handleStripeWebhook };
