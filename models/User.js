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
        select: false  // Don't return the password by default in queries
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
        default: 'no-photo.jpg'  // Default to no-photo if none is provided
    },
    phone: {
        type: String, 
        required: true,  // Make phone required for all users
        match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number']
    },
    isVerified: { 
        type: Boolean, 
        default: false  // Defaults to false, updated upon OTP or email verification
    },
    verificationToken: { 
        type: String  // For token-based verification (if used)
    },
    verificationExpires: { 
        type: Date  // Expiry time for verification token
    },
    otp: {
        type: String  // OTP for email or phone verification
    },
    otpExpires: {
        type: Date  // Expiry time for the OTP
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});

// Hash the password before saving (if it's modified or created)
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Match the entered password with the hashed password in the database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
