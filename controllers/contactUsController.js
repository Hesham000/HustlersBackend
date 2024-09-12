const Inquiry = require('../models/Inquiry'); // Import the correct Inquiry model

// Contact Us controller
exports.contactUs = async (req, res) => {
    const { question } = req.body;
    const userId = req.user.id; // Extract user ID from the token
    const userEmail = req.user.email; // Assuming user email is available in req.user

    try {
        // Validate request body
        if (!question) {
            return res.status(400).json({ success: false, error: 'Question is required' });
        }

        // Store the inquiry in the database
        const inquiry = await Inquiry.create({
            user: userId,
            question,
        });

        // Respond to the client
        res.status(200).json({
            success: true,
            message: 'Your inquiry has been submitted.',
            data: inquiry // Optionally include the inquiry data
        });
    } catch (err) {
        console.error('Error processing inquiry:', err.message);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
