const nodemailer = require('nodemailer');

// Ensure required environment variables are defined
const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'FROM_EMAIL'];
requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        process.exit(1); // Exit process if any critical environment variables are missing
    }
});

// Create a nodemailer transporter using the defined SMTP configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT), // Convert port to number
    secure: process.env.SMTP_PORT === '465', // Enable secure connection if port 465 is used
    auth: {
        user: process.env.EMAIL_USER, // SMTP user
        pass: process.env.EMAIL_PASS, // SMTP password
    },
});

/**
 * Sends a verification email to the provided email address with a verification URL.
 * @param {string} email - The recipient's email address.
 * @param {string} verificationUrl - The URL the user clicks to verify their email.
 * @returns {Promise} - Resolves if email is successfully sent, otherwise throws an error.
 */
const sendVerificationEmail = async (email, verificationUrl) => {
    // Validate the required parameters
    if (!email || !verificationUrl) {
        const errorMessage = 'Email and verification URL are required.';
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    // Define the email content and format
    const mailOptions = {
        from: process.env.FROM_EMAIL, // Sender's email (from .env file)
        to: email,                    // Recipient's email
        subject: 'Email Verification', // Subject of the email
        text: `Please verify your email by clicking the following link: ${verificationUrl}`, // Plain text content
        html: `
            <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f4; padding: 20px;">
                <div style="background-color: #ffffff; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 8px;">
                    <h1 style="color: #4CAF50;">Verify Your Email</h1>
                    <p>Thank you for registering! To complete your registration, please verify your email by clicking the button below:</p>
                    <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
                    <p>If the button doesn't work, please copy and paste the following link into your browser:</p>
                    <p>${verificationUrl}</p>
                    <p>If you did not request this, please disregard this email.</p>
                </div>
                <footer style="font-size: 12px; color: #777; margin-top: 20px;">&copy; 2024 Your Company. All rights reserved.</footer>
            </div>
        `, // HTML content with styling
    };

    try {
        // Attempt to send the email
        const info = await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}: ${info.messageId}`);
        return info; // Return info object if email was successfully sent
    } catch (error) {
        // Log and throw error if email could not be sent
        console.error(`Error sending verification email to ${email}:`, error.message);
        throw new Error('Email could not be sent');
    }
};

module.exports = { sendVerificationEmail };
