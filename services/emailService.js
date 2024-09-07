const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');

// Ensure required environment variables are defined
const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'FROM_EMAIL', 'OTP_SECRET'];
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
 * Generates a time-based OTP using Speakeasy
 * @returns {string} - The generated OTP code.
 */
const generateOtp = () => {
    return speakeasy.totp({
        secret: process.env.OTP_SECRET,
        encoding: 'base32',
        step: 600, // 10-minute validity (step in seconds)
    });
};

/**
 * Verifies the OTP using Speakeasy
 * @param {string} otp - The OTP code to verify.
 * @returns {boolean} - Returns true if the OTP is valid, otherwise false.
 */
const verifyOtp = (otp) => {
    return speakeasy.totp.verify({
        secret: process.env.OTP_SECRET,
        encoding: 'base32',
        token: otp,
        step: 600, // 10-minute validity (step in seconds)
        window: 1, // Allows one step backward for slight time mismatch
    });
};

/**
 * Sends an OTP email to the provided email address.
 * @param {string} email - The recipient's email address.
 * @param {string} otp - The OTP code to be sent for verification.
 * @returns {Promise} - Resolves if the email is successfully sent, otherwise throws an error.
 */
const sendVerificationOtp = async (email, otp) => {
    // Validate the required parameters
    if (!email || !otp) {
        const errorMessage = 'Email and OTP are required.';
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    // Define the email content and format
    const mailOptions = {
        from: process.env.FROM_EMAIL, // Sender's email (from .env file)
        to: email,                    // Recipient's email
        subject: 'Your OTP Code',      // Subject of the email
        text: `Your One-Time Password (OTP) is: ${otp}. It is valid for 10 minutes.`, // Plain text content
        html: `
            <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f4; padding: 20px;">
                <div style="background-color: #ffffff; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 8px;">
                    <h1 style="color: #4CAF50;">Your OTP Code</h1>
                    <p>Thank you for registering! Your One-Time Password (OTP) is:</p>
                    <h2 style="color: #4CAF50;">${otp}</h2>
                    <p>This code is valid for 10 minutes. Please use it to verify your email address.</p>
                    <p>If you did not request this, please disregard this email.</p>
                </div>
                <footer style="font-size: 12px; color: #777; margin-top: 20px;">&copy; 2024 Your Company. All rights reserved.</footer>
            </div>
        `, // HTML content with styling
    };

    try {
        // Attempt to send the email
        const info = await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${email}: ${info.messageId}`);
        return info; // Return info object if email was successfully sent
    } catch (error) {
        // Log and throw error if email could not be sent
        console.error(`Error sending OTP email to ${email}:`, error.message);
        throw new Error('Email could not be sent');
    }
};

module.exports = { sendVerificationOtp, generateOtp, verifyOtp };
