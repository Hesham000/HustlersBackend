const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');

// Create Payment Intent via Stripe API
exports.createPaymentIntent = async (req, res) => {
    const { amount, currency, user, package } = req.body;

    try {
        // Create a payment intent using Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount, // amount in cents
            currency: currency || 'aed', // Default to USD if not specified
            metadata: {
                userId: user,
                packageId: package,
            },
        });

        res.status(201).json({ success: true, clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error('Error creating payment intent:', err.message);
        res.status(400).json({ success: false, error: 'Failed to create payment intent' });
    }
};

// Save payment in the database after the payment intent is confirmed
exports.createPayment = async (req, res) => {
    const { user, package, amount, status = 'pending', transactionId, paymentMethod } = req.body;

    try {
        // Check if user exists
        const userExists = await User.findById(user);
        if (!userExists) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Check if package exists
        const packageExists = await Package.findById(package);
        if (!packageExists) {
            return res.status(404).json({ success: false, error: 'Package not found' });
        }

        // Create the payment record
        const newPayment = await Payment.create({
            user,
            package,
            amount,
            status,
            transactionId,
            paymentMethod,
        });

        res.status(201).json({ success: true, data: newPayment });
    } catch (err) {
        console.error('Error creating payment:', err.message);
        res.status(500).json({ success: false, error: 'Server error. Please try again later.' });
    }
};


// Retrieve all payments
exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('user', 'name email') // Populate only the user name and email
            .populate('package', 'name price'); // Populate the package with required fields (e.g., name and price)
        res.status(200).json({ success: true, data: payments });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Retrieve a single payment by ID
exports.getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('user', 'name email') // Populate the user fields
            .populate('package', 'name price'); // Populate the package fields
        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }
        res.status(200).json({ success: true, data: payment });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
    try {
        const payment = await Payment.findByIdAndUpdate(req.params.id, { status: req.body.status }, {
            new: true,
            runValidators: true,
        });

        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }

        res.status(200).json({ success: true, data: payment });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
