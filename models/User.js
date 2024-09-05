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
        sparse: true // `sparse` ensures that the uniqueness constraint only applies to documents that have the `googleId` field
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
    isVerified: { 
        type: Boolean, 
        default: false 
    },  // Track if the user has verified their email
    verificationToken: { 
        type: String 
    },  // Token for email verification
    verificationExpires: { 
        type: Date 
    },  // Expiry time for the verification token
    createdAt: { 
        type: Date, 
        default: Date.now 
    },  // Timestamp for when the user was created
});

// Pre-save middleware to hash the password before saving
UserSchema.pre('save', async function(next) {
    // If password is not modified or not present, skip hashing
    if (!this.isModified('password') || !this.password) {
        next();
    }

    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare the entered password with the hashed password
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
