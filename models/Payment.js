const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    transactionId: { type: String, unique: true },  // Stripe transaction ID
    paymentMethod: { type: String, enum: ['card', 'paypal'], required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', PaymentSchema);
