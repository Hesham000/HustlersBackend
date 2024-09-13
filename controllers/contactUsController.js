const Inquiry = require('../models/Inquiry'); // Import the correct Inquiry model

// Contact Us controller
exports.contactUs = async (req, res) => {
    const { question } = req.body;
    const userId = req.user.id; // Extract user ID from the token

    try {
        if (!question) {
            return res.status(400).json({ success: false, error: 'Question is required' });
        }

        const inquiry = await Inquiry.create({ user: userId, question });

        res.status(200).json({
            success: true,
            message: 'Your inquiry has been submitted.',
            data: inquiry
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Get all inquiries
exports.getAllInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find().populate('user', 'name email'); // Populate user info if needed

        res.status(200).json({
            success: true,
            data: inquiries
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to retrieve inquiries' });
    }
};
