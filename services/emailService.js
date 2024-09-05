const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendVerificationEmail = async (email, verificationUrl) => {
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: 'Email Verification',
        text: `Please verify your email by clicking the following link: ${verificationUrl}`,
        html: `<p>Please verify your email by clicking the following link: <a href="${verificationUrl}">Verify Email</a></p>`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}: ${info.messageId}`);
    } catch (error) {
        console.error(`Error sending verification email to ${email}:`, error.message);
        throw new Error('Email could not be sent');
    }
};

module.exports = { sendVerificationEmail };
