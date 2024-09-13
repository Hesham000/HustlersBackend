const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a payment intent with packageId in the metadata
const createPaymentIntent = async (req, res) => {
    const { amount, currency = 'aed', packageId } = req.body;

    // Ensure userId comes from req.user if using authentication middleware
    const userId = req.user?.id;

    // Check if required fields are provided
    if (!amount || !packageId) {
        return res.status(400).json({
            success: false,
            error: 'Amount and packageId are required.',
        });
    }

    // Ensure amount is a positive integer (smallest unit like cents for USD)
    if (!Number.isInteger(amount) || amount <= 0) {
        return res.status(400).json({
            success: false,
            error: 'Amount must be a positive integer in the smallest currency unit (e.g., cents for USD).',
        });
    }

    try {
        // Create a payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount,  // Amount in smallest currency unit (e.g., cents for USD)
            currency,
            metadata: {
                packageId,  // Package ID for metadata
                userId      // User ID for metadata (from req.user)
            },
            automatic_payment_methods: {
                enabled: true,  // Enable automatic payment methods
            },
            payment_method_options: {
                card: {
                    request_three_d_secure: 'automatic',  // Enable 3D Secure when required
                },
            },
        });

        // Respond with the payment intent's client_secret and other data
        res.status(201).json({
            success: true,
            clientSecret: paymentIntent.client_secret,  // Client secret for the frontend to confirm payment
            paymentIntent,  // Optionally return the entire payment intent object
            next_action: paymentIntent.next_action || null,  // Handle any additional actions like 3D Secure
        });
    } catch (error) {
        // Handle Stripe errors and log detailed messages
        console.error('Error creating payment intent:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to create payment intent',
            details: error.message,
        });
    }
};

module.exports = {
    createPaymentIntent,
};
