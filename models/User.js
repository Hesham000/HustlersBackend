const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },  // Password will be null for Google-authenticated users
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, default: 'user' },
    image: { type: String, default: 'no-photo.jpg' },
    createdAt: { type: Date, default: Date.now },
});

// Hash password before saving if it is modified or new
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to match user-entered password with the hashed password in the database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
