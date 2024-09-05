const speakeasy = require('speakeasy');
const { sendEmail } = require('./emailService');

const generateOtp = () => {
    return speakeasy.totp({
        secret: process.env.OTP_SECRET,
        encoding: 'base32',
        digits: 6,
        step: 300,
    });
};

const verifyOtp = (otp, hashedOtp) => {
    return speakeasy.totp.verify({
        secret: process.env.OTP_SECRET,
        encoding: 'base32',
        token: otp,
        window: 1,
    });
};

// Define the sendOtpEmail function
const sendOtpEmail = async (email, otp) => {
    const subject = 'Your OTP Code';
    const text = `Your OTP code is ${otp}`;
    await sendEmail(email, subject, text);
};

// Export the functions
module.exports = { generateOtp, verifyOtp, sendOtpEmail };
