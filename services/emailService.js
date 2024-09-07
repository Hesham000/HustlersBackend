const nodemailer = require('nodemailer');

// Check that all necessary environment variables are defined
if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.FROM_EMAIL) {
    console.error('Missing required email environment variables.');
    process.exit(1); // Exit the process if critical env variables are missing
}

// Create transporter using the provided SMTP credentials
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // SMTP user
        pass: process.env.EMAIL_PASS, // SMTP password
    },
});

/**
 * Sends a verification email to the provided email address with a verification URL.
 * @param {string} email - The recipient's email address.
 * @param {string} verificationUrl - The URL the user clicks to verify their email.
 */
const sendVerificationEmail = async (email, verificationUrl) => {
    // Validate email and verification URL
    if (!email || !verificationUrl) {
        console.error('Email and verification URL are required.');
        throw new Error('Email and verification URL must be provided.');
    }

    // Define email options
    const mailOptions = {
        from: process.env.FROM_EMAIL, // Sender address (from environment variable)
        to: email,                    // Recipient's email address
        subject: 'Email Verification', // Email subject
        text: `Please verify your email by clicking the following link: ${verificationUrl}`, // Plain text version of the message
        html: `<p>Please verify your email by clicking the following link: <a href="${verificationUrl}">Verify Email</a></p>`, // HTML version of the message
    };

    try {
        // Send the email using the transporter
        const info = await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}: ${info.messageId}`);
        return info; // Optionally return the info object for further use
    } catch (error) {
        console.error(`Error sending verification email to ${email}:`, error.message);
        throw new Error('Email could not be sent');
    }
};

module.exports = { sendVerificationEmail };
