// controllers/privacyPolicyController.js
const PrivacyPolicy = require('../models/PrivacyPolicy');

// Create Privacy Policy
exports.createPrivacyPolicy = async (req, res) => {
    const { title, description } = req.body;

    try {
        const policy = await PrivacyPolicy.create({ title, description });
        res.status(201).json({
            success: true,
            data: policy
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// Get Privacy Policy
exports.getPrivacyPolicy = async (req, res) => {
    try {
        const policy = await PrivacyPolicy.findOne(); // Assuming there's only one policy
        if (!policy) {
            return res.status(404).json({
                success: false,
                message: 'Privacy policy not found'
            });
        }
        res.status(200).json({
            success: true,
            data: policy
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// Update Privacy Policy
exports.updatePrivacyPolicy = async (req, res) => {
    const { title, description } = req.body;

    try {
        const policy = await PrivacyPolicy.findOne();
        if (!policy) {
            return res.status(404).json({
                success: false,
                message: 'Privacy policy not found'
            });
        }

        policy.title = title || policy.title;
        policy.description = description || policy.description;
        policy.updatedAt = Date.now();

        await policy.save();

        res.status(200).json({
            success: true,
            data: policy
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
