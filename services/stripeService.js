const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a payment intent with packageId in the metadata
const createPaymentIntent = async (req, res) => {
    const { amount, currency = 'aed', packageId, userId } = req.body;

    // Check if amount and packageId are provided
    if (!amount || !packageId) {
        return res.status(400).json({
            success: false,
            error: 'Amount and packageId are required',
        });
    }

    try {
        // Create a payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount,  // Amount is in the smallest currency unit (e.g., cents for USD)
            currency,
            metadata: {
                packageId,  // Add the packageId to the metadata
                userId      // Add the userId to the metadata (optional)
            },
            automatic_payment_methods: {
                enabled: true,  // Allow automatic payment methods
            },
            payment_method_options: {
                card: {
                    request_three_d_secure: 'automatic',  // Ensure 3D Secure when required
                },
            },
        });

        // Respond with the payment intent object
        res.status(201).json({
            success: true,
            clientSecret: paymentIntent.client_secret,  // Return the client_secret for frontend confirmation
            paymentIntent,  // Optional: Return the entire payment intent object
            next_action: paymentIntent.next_action || null,  // Handle any additional actions required
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
