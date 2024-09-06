const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true, index: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    transactionId: { type: String, unique: true },  // Transaction details from Stripe
    paymentMethod: { type: String, enum: ['credit_card', 'paypal', 'bank_transfer'], required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', PaymentSchema);
