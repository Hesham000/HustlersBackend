// controllers/termsConditionController.js
const TermsCondition = require('../models/TermsCondition');

// Create Terms and Conditions
exports.createTermsCondition = async (req, res) => {
    const { title, description } = req.body;

    try {
        const terms = await TermsCondition.create({ title, description });
        res.status(201).json({
            success: true,
            data: terms
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// Get Terms and Conditions
exports.getTermsCondition = async (req, res) => {
    try {
        const terms = await TermsCondition.findOne(); // Assuming there's only one set of terms
        if (!terms) {
            return res.status(404).json({
                success: false,
                message: 'Terms and Conditions not found'
            });
        }
        res.status(200).json({
            success: true,
            data: terms
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// Update Terms and Conditions
exports.updateTermsCondition = async (req, res) => {
    const { title, description } = req.body;

    try {
        const terms = await TermsCondition.findOne();
        if (!terms) {
            return res.status(404).json({
                success: false,
                message: 'Terms and Conditions not found'
            });
        }

        terms.title = title || terms.title;
        terms.description = description || terms.description;
        terms.updatedAt = Date.now();

        await terms.save();

        res.status(200).json({
            success: true,
            data: terms
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
