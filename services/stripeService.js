const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata,  // Optional: Add any metadata you'd like to associate with the payment
        });
        return paymentIntent;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw new Error('Payment initiation failed');
    }
};

const retrievePaymentIntent = async (paymentIntentId) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent;
    } catch (error) {
        console.error('Error retrieving payment intent:', error);
        throw new Error('Payment retrieval failed');
    }
};

module.exports = {
    createPaymentIntent,
    retrievePaymentIntent,
};
