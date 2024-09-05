const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSms = async (to, message) => {
    try {
        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });
        console.log(`SMS sent to ${to}`);
    } catch (error) {
        console.error(`Error sending SMS to ${to}:`, error);
        throw new Error('SMS could not be sent');
    }
};

module.exports = { sendSms };
