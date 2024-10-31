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
        type: String,
        default: 'https://res.cloudinary.com/dfz9bci61/image/upload/v1727900065/user_images/ullus0wn7fljtwhnqghm.png'
        },
    phone: {
        type: String, 
        match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
        default: null
    },
    fcmToken: {
        type: String,  // FCM token for sending push notifications
        default: null,
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    verificationToken: { 
        type: String 
    },
    verificationExpires: { 
        type: Date 
    },
    otp: {
        type: String 
    },
    otpExpires: {
        type: Date 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
    // Only hash the password if it's new or being modified and exists as a string
    if (!this.isModified('password') || !this.password || typeof this.password !== 'string') {
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Match user password for login
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate OTP for user verification
UserSchema.methods.generateOTP = function() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    this.otp = otp;
    this.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    return otp;
};

// Verify OTP
UserSchema.methods.verifyOTP = function(enteredOtp) {
    return this.otp === enteredOtp && Date.now() < this.otpExpires; // Check if OTP is valid and not expired
};

module.exports = mongoose.model('User', UserSchema);
