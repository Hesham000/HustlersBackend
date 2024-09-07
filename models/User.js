const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'], 
        index: true 
    },
    password: { 
        type: String, 
        minlength: 6,
        select: false  // Exclude password from query results by default
    },
    googleId: { 
        type: String, 
        unique: true, 
        sparse: true  // Allow for users who register without Google
    },
    role: { 
        type: String, 
        enum: ['user', 'admin', 'moderator'], 
        default: 'user' 
    },
    image: { 
        type: String,  // Storing the image as a Base64-encoded string
        default: 'data:image/jpeg;base64,<default_base64_image>'  // Replace with actual base64 default image string
    },
    phone: {
        type: String, 
        required: true,  // Phone number required
        match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number']
    },
    isVerified: { 
        type: Boolean, 
        default: false  // Defaults to false until verification
    },
    verificationToken: { 
        type: String  // Used for token-based email verification (if needed)
    },
    verificationExpires: { 
        type: Date  // Expiry time for verification token
    },
    otp: {
        type: String  // Stores OTP for email/phone verification
    },
    otpExpires: {
        type: Date  // Expiry time for OTP
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});

// Pre-save middleware to hash the password before saving or updating
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    // Hash the password with bcrypt
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare the entered password with the hashed password in the database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate OTP (for phone/email verification)
UserSchema.methods.generateOTP = function() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
    this.otp = otp;
    this.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    return otp;
};

// Method to verify OTP
UserSchema.methods.verifyOTP = function(enteredOtp) {
    return this.otp === enteredOtp && Date.now() < this.otpExpires;
};

module.exports = mongoose.model('User', UserSchema);
