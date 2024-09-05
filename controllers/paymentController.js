const Payment = require('../models/Payment');

// Create a Payment
exports.createPayment = async (req, res) => {
    const { user, package, amount, status, transactionId, paymentMethod } = req.body;
    
    try {
        const newPayment = await Payment.create({ user, package, amount, status, transactionId, paymentMethod });
        res.status(201).json({ success: true, data: newPayment });
    } catch (err) {
        console.error('Error creating payment:', err.message);
        res.status(400).json({ success: false, error: err.message });
    }
};

// Get All Payments
exports.getPayments = async (req, res) => {
    try {
        // Populate user and package fields
        const payments = await Payment.find()
            .populate('user', 'name email') // Populate only name and email of user
            .populate('package', 'name'); // Populate only name of package
        res.status(200).json({ success: true, data: payments });
    } catch (err) {
        console.error('Error fetching payments:', err.message);
        res.status(400).json({ success: false, error: err.message });
    }
};

// Get Payment by ID
exports.getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('user', 'name email')
            .populate('package', 'name');
        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }
        res.status(200).json({ success: true, data: payment });
    } catch (err) {
        console.error('Error fetching payment by ID:', err.message);
        res.status(400).json({ success: false, error: err.message });
    }
};

// Update Payment Status
exports.updatePaymentStatus = async (req, res) => {
    try {
        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        ).populate('user', 'name email').populate('package', 'name');

        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }

        res.status(200).json({ success: true, data: payment });
    } catch (err) {
        console.error('Error updating payment status:', err.message);
        res.status(400).json({ success: false, error: err.message });
    }
};
