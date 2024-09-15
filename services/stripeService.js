require('dotenv').config();  // Load environment variables

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);  // Use the secret key from .env

/**
 * Create a Stripe Payment Intent with supported payment methods for the currency
 * @param {number} amount - The amount in the smallest currency unit (e.g., fils for AED)
 * @param {string} currency - Currency code, default is AED
 * @returns {Promise<Object>} Payment intent object from Stripe
 */
const createPaymentIntent = async (amount, currency = 'aed') => {
  try {
    // Define the supported payment methods based on the currency
    let paymentMethodTypes = ['card'];  // Cards are globally supported, includes Apple Pay and Google Pay

    // Adjust payment methods based on currency
    if (currency === 'aed') {
      // For AED, only card is supported (Apple Pay/Google Pay is automatically included with card)
      paymentMethodTypes = ['card'];
    } else if (currency === 'eur') {
      // For EUR, you can use Bancontact, iDEAL, SEPA, etc.
      paymentMethodTypes = ['card', 'bancontact', 'ideal', 'sepa_debit', 'sofort'];
    } else if (currency === 'usd') {
      // For USD, you can use additional methods like ACH, Alipay, etc.
      paymentMethodTypes = ['card', 'alipay', 'ach_credit_transfer'];
    }

    // Create the payment intent with the correct methods based on the currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,  // Amount in the smallest currency unit (e.g., 100 AED = 10000 fils)
      currency,
      payment_method_types: paymentMethodTypes,
    });

    return paymentIntent;
  } catch (error) {
    throw new Error(`Error creating payment intent: ${error.message}`);
  }
};

module.exports = { createPaymentIntent };
