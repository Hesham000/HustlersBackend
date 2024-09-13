    // controllers/paymentController.js
    const Payment = require('../models/Payment');
    const { createPaymentIntent } = require('../services/stripeService');

    // Create Payment Intent (for mobile app to confirm the payment on frontend)
    exports.createPaymentIntent = async (req, res) => {
        const { amount, currency, packageId } = req.body;

        try {
            // Assuming req.user contains authenticated user's info
            const userId = req.user.id;
            
            // Create payment intent using Stripe Service
            const paymentIntent = await createPaymentIntent(amount, currency, packageId, userId);

            // Respond with the client_secret needed to confirm payment on the mobile app
            res.status(201).json({
                success: true,
                clientSecret: paymentIntent.client_secret,
                paymentIntent,
            });
        } catch (error) {
            console.error('Error creating payment intent:', error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    };

    // Store Payment in the database after the payment is confirmed
    exports.createPayment = async (req, res) => {
        const { packageId, amount, transactionId, paymentMethod } = req.body;

        try {
            // Check if package exists (for additional validation)
            const userId = req.user.id;

            const payment = await Payment.create({
                user: userId,
                package: packageId,
                amount,
                status: 'pending', // Update later when payment is confirmed
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
                .populate('user', 'name email')
                .populate('package', 'title price');
            res.status(200).json({ success: true, data: payments });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    };

    // Update payment status
    exports.updatePaymentStatus = async (req, res) => {
        try {
            const payment = await Payment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });

            if (!payment) {
                return res.status(404).json({ success: false, error: 'Payment not found' });
            }

            res.status(200).json({ success: true, data: payment });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    };
