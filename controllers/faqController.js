// controllers/faqController.js
const FAQ = require('../models/FAQ');

// Add a new FAQ
exports.addFAQ = async (req, res) => {
    const { question, answer } = req.body;

    try {
        const faq = await FAQ.create({ question, answer });
        res.status(201).json({
            success: true,
            data: faq
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// Get all FAQs
exports.getFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find();
        res.status(200).json({
            success: true,
            data: faqs
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// Update an existing FAQ
exports.updateFAQ = async (req, res) => {
    const { question, answer } = req.body;

    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) {
            return res.status(404).json({
                success: false,
                error: 'FAQ not found'
            });
        }

        faq.question = question || faq.question;
        faq.answer = answer || faq.answer;
        faq.updatedAt = Date.now();

        await faq.save();

        res.status(200).json({
            success: true,
            data: faq
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// Delete an FAQ
exports.deleteFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndDelete(req.params.id);
        if (!faq) {
            return res.status(404).json({
                success: false,
                error: 'FAQ not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'FAQ deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
