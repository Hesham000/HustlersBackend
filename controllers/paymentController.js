const Payment = require('../models/Payment');

// Create a Payment
exports.createPayment = async (req, res) => {
    const { user, package, amount, status } = req.body;
    try {
        const newPayment = await Payment.create({ user, package, amount, status });
        res.status(201).json({ success: true, data: newPayment });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Get All Payments
exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.find().populate('user').populate('package');
        res.status(200).json({ success: true, data: payments });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Get Payment by ID
exports.getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('user').populate('package');
        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }
        res.status(200).json({ success: true, data: payment });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Update Payment Status
exports.updatePaymentStatus = async (req, res) => {
    try {
        const payment = await Payment.findByIdAndUpdate(req.params.id, { status: req.body.status }, {
            new: true,
            runValidators: true,
        });
        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }
        res.status(200).json({ success: true, data: payment });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
