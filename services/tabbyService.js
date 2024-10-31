require('dotenv').config();
const axios = require('axios');

const TABBY_SECRET_KEY = process.env.TABBY_SECRET_KEY;
const TABBY_API_URL = process.env.TABBY_API_URL;

const createTabbySession = async (amount, currency, user, packageDetails) => {
  try {
    // Request payload to create a payment session with Tabby
    const payload = {
      amount,
      currency,
      payment: {
        buyer: {
          email: user.email,
          phone: user.phone,
          name: user.name
        },
        items: [
          {
            title: packageDetails.title,
            description: packageDetails.description,
            unit_price: packageDetails.priceAfterDiscount,
            quantity: 1
          }
        ],
        order: {
          reference_id: `pkg_${packageDetails._id}`,  // Reference to package ID
          description: `Payment for package: ${packageDetails.title}`
        }
      },
    };

    // Send POST request to Tabby to create a session
    const response = await axios.post(`${TABBY_API_URL}/checkout`, payload, {
      headers: {
        Authorization: `Bearer ${TABBY_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;  // Return the session data with checkout URL
  } catch (error) {
    console.error('Error creating Tabby session:', error.response?.data || error.message);
    throw new Error('Failed to create Tabby session.');
  }
};

module.exports = { createTabbySession };
