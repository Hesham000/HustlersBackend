const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);  // Use Stripe Secret Key
const Payment = require('../models/Payment');  // Payment model

/**
 * Handle Stripe webhook events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];  // Extract the Stripe signature
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;  // Webhook secret from Stripe

  let event;

  try {
    // Construct the event from the raw body and Stripe signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await updatePaymentStatus(paymentIntent.id, 'completed');
      break;
    case 'payment_intent.payment_failed':
      const paymentFailedIntent = event.data.object;
      await updatePaymentStatus(paymentFailedIntent.id, 'failed');
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Acknowledge receipt of the event
  res.json({ received: true });
};

/**
 * Update payment status in the database based on Stripe's payment intent ID
 * @param {string} transactionId - Stripe's payment intent ID
 * @param {string} status - The new status of the payment (e.g., 'completed' or 'failed')
 */
const updatePaymentStatus = async (transactionId, status) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { transactionId },  // Find payment by Stripe transaction ID
      { status },         // Update the status
      { new: true }       // Return the updated document
    );
    console.log(`Payment status updated to '${status}' for transaction ID: ${transactionId}`);
  } catch (error) {
    console.error(`Error updating payment status: ${error.message}`);
  }
};

module.exports = { handleStripeWebhook };
