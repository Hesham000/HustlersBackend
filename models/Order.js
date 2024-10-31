// models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    order_id: {
        type: String,
        unique: true,
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    package_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    total_amount: {
        type: Number,
        required: true,
    },
    payment_status: {
        type: String,
        enum: ['Failed', 'Success'],
        default: 'Failed',
    },
    order_status: {
        type: String,
        enum: ['Pending', 'Approved'],
        default: 'Pending',
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

// Generate unique 7-digit order_id before saving
OrderSchema.pre('save', async function (next) {
    if (!this.order_id) {
        this.order_id = Math.floor(1000000 + Math.random() * 9000000).toString();
    }
    next();
});

module.exports = mongoose.model('Order', OrderSchema);
