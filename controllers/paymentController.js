const Payment = require('../models/Payment');
const Package = require('../models/Package');
const { createCheckoutSession } = require('../services/stripeService');

// Create Stripe Checkout Session (redirects to Stripe's payment page)
exports.createCheckoutSession = async (req, res) => {
    const { currency, packageId } = req.body;

    try {
        // Assuming req.user contains authenticated user's info
        const userId = req.user.id;

        // Fetch the package and ensure it exists
        const packageData = await Package.findById(packageId);
        if (!packageData) {
            return res.status(404).json({
                success: false,
                error: 'Package not found.',
            });
        }

        // Get the amount from the package price
        const amount = packageData.priceAfterDiscount * 100; // Convert to smallest currency unit (e.g., cents)

        // Create Stripe Checkout session using the Stripe Service
        const session = await createCheckoutSession(amount, currency, packageId, userId);

        // Respond with the Stripe Checkout session URL to redirect the user
        res.status(201).json({
            success: true,
            sessionId: session.id,
            url: session.url, // Stripe Checkout page URL to redirect the user
        });
    } catch (error) {
        console.error('Error creating Stripe Checkout session:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Store Payment in the database after the payment is confirmed
exports.createPayment = async (req, res) => {
    const { packageId, transactionId, paymentMethod } = req.body;

    try {
        // Assuming req.user contains authenticated user's info
        const userId = req.user.id;

        // Fetch the package and ensure it exists
        const packageData = await Package.findById(packageId);
        if (!packageData) {
            return res.status(404).json({
                success: false,
                error: 'Package not found.',
            });
        }

        // Get the amount from the package price
        const amount = packageData.priceAfterDiscount * 100; // Convert to smallest currency unit (e.g., cents)

        // Create the payment record
        const payment = await Payment.create({
            user: userId,
            package: packageId,
            amount,
            status: 'pending', // Status can be updated later after payment confirmation
            transactionId,
            paymentMethod,
        });

        res.status(201).json({ success: true, data: payment });
    } catch (error) {
        console.error('Error creating payment:', error.message);
        res.status(500).json({ success: false, error: 'Server error, please try again later.' });
    }
};

// Get all payments (admin only)
exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('user', 'name email')    // Populate the user fields
            .populate('package', 'title price'); // Populate the package fields

        res.status(200).json({ success: true, data: payments });
    } catch (error) {
        console.error('Error fetching payments:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get a single payment by ID
exports.getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('user', 'name email')    // Populate the user fields
            .populate('package', 'title price'); // Populate the package fields

        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }

        res.status(200).json({ success: true, data: payment });
    } catch (error) {
        console.error('Error fetching payment:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update payment status (admin only)
exports.updatePaymentStatus = async (req, res) => {
    try {
        const payment = await Payment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });

        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }

        res.status(200).json({ success: true, data: payment });
    } catch (error) {
        console.error('Error updating payment status:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};
