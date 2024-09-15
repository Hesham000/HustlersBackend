const Payment = require('../models/Payment');
const Package = require('../models/Package');
const { createPaymentIntent } = require('../services/stripeService');

/**
 * Create a payment and return client secret to the client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createPayment = async (req, res) => {
  try {
    const { packageId, paymentMethod } = req.body;
    const userId = req.user._id;  // Assuming user is authenticated

    // Fetch package details
    const selectedPackage = await Package.findById(packageId);
    if (!selectedPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    // Calculate payment amount (in the smallest AED unit)
    const amount = Math.round(selectedPackage.priceAfterDiscount * 100);

    // Create payment intent using Stripe
    const paymentIntent = await createPaymentIntent(amount, 'aed');

    // Save payment to MongoDB
    const payment = new Payment({
      user: userId,
      package: packageId,
      amount: selectedPackage.priceAfterDiscount,
      status: 'pending',  // Payment starts as pending
      transactionId: paymentIntent.id,  // Stripe transaction ID
      paymentMethod,
    });

    await payment.save();

    // Respond with client secret to the client
    res.status(201).json({
      message: 'Payment initiated successfully',
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,  // Return the payment ID
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Payment creation failed' });
  }
};

/**
 * Get all payments for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPayments = async (req, res) => {
  try {
    const userId = req.user._id;  // Assuming user is authenticated

    // Fetch all payments made by the authenticated user
    const payments = await Payment.find({ user: userId }).populate('package');  // Populate package info

    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: 'No payments found for this user' });
    }

    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
};

/**
 * Get a specific payment by its ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id;  // Assuming user is authenticated

    // Find the payment by ID and ensure the payment belongs to the authenticated user
    const payment = await Payment.findOne({ _id: paymentId, user: userId }).populate('package');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Error fetching payment' });
  }
};

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
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event types
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    // Update payment status to 'completed' in MongoDB
    await Payment.findOneAndUpdate(
      { transactionId: paymentIntent.id },
      { status: 'completed' }
    );
  }

  res.json({ received: true });
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  handleStripeWebhook,
};
