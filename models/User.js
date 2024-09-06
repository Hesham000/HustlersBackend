const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the schema for the User model
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
        minlength: 6 
    },
    googleId: { 
        type: String, 
        unique: true, 
        sparse: true 
    },
    role: { 
        type: String, 
        enum: ['user', 'admin', 'moderator'], 
        default: 'user' 
    },
    image: { 
        type: String, 
        default: 'no-photo.jpg' 
    },
    phone: {
        type: String, 
        required: true,  // Make phone required
        match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number']
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
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});

// Pre-save middleware to hash the password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare the entered password with the hashed password
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
