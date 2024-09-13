const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Package = require('../models/Package');
const createCheckoutSession = async (req, res) => {
    const { packageId, currency = 'aed' } = req.body;
    const userId = req.user?.id; // Ensure you have the userId from authentication middleware

    // Validate inputs
    if (!packageId) {
        return res.status(400).json({
            success: false,
            error: 'PackageId is required.',
        });
    }

    try {
        // Fetch the package from the database
        const packageData = await Package.findById(packageId);

        if (!packageData) {
            return res.status(404).json({
                success: false,
                error: 'Package not found.',
            });
        }

        // Use priceAfterDiscount or price for the amount
        const amount = packageData.priceAfterDiscount * 100; // Convert to smallest currency unit (e.g., cents)

        // Create a Checkout Session using Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], // Specify allowed payment methods
            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: {
                            name: packageData.title, // Use the package title
                        },
                        unit_amount: amount, // Amount in smallest currency unit (e.g., cents)
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment', // One-time payment mode
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`, // Redirect here on success
            cancel_url: `${process.env.FRONTEND_URL}/cancel`, // Redirect here if the user cancels
            metadata: {
                packageId, // Include packageId in metadata
                userId,    // Include userId in metadata
            },
        });

        // Respond with the URL of the Checkout Session
        res.status(200).json({
            success: true,
            sessionId: session.id, // Return session ID for the frontend
            url: session.url,      // Stripe Checkout page URL to redirect the user
        });
    } catch (error) {
        console.error('Error creating checkout session:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to create checkout session',
            details: error.message,
        });
    }
};

module.exports = {
    createCheckoutSession,
};
