// controllers/partnerController.js
const Partner = require('../models/Partner');
const cloudinary = require('../utils/cloudinaryConfig');

// Add a new partner
exports.addPartner = async (req, res) => {
    const { name } = req.body;

    try {
        if (!name) {
            return res.status(400).json({ success: false, error: 'Partner name is required' });
        }

        let logoUrl = null; // Initialize logoUrl as null

        // If a logo file is uploaded, upload it to Cloudinary
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'partner_logos' },
                    (error, result) => {
                        if (error) {
                            reject(new Error('Failed to upload logo to Cloudinary'));
                        } else {
                            resolve(result);
                        }
                    }
                );
                uploadStream.end(req.file.buffer);
            });

            logoUrl = result.secure_url; // Assign Cloudinary URL after upload
        }

        // Create the new partner
        const newPartner = await Partner.create({
            name,
            logoUrl, // Store the Cloudinary URL
        });

        res.status(201).json({ success: true, data: newPartner });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Get all partners
exports.getPartners = async (req, res) => {
    try {
        const partners = await Partner.find();
        res.status(200).json({ success: true, data: partners });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Delete a partner
exports.deletePartner = async (req, res) => {
    try {
        const partner = await Partner.findByIdAndDelete(req.params.id);

        if (!partner) {
            return res.status(404).json({ success: false, error: 'Partner not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
