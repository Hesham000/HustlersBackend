const mongoose = require('mongoose');
const Package = require('../models/Package');
const cloudinary = require('../utils/cloudinaryConfig');

// Helper function to format number as two decimal places string
function formatToTwoDecimals(value) {
    return parseFloat(value).toFixed(2);
}

// Add a new package
exports.addPackage = async (req, res) => {
    const { title, description, price, packageFeatures, priceAfterDiscount } = req.body;

    try {
        let imageUrl = null;
        let videoUrl = null;

        // If the request includes an image file, upload it to Cloudinary
        if (req.files && req.files.image) {
            const imageResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'package_images' },
                    (error, result) => {
                        if (error) {
                            reject(new Error('Failed to upload image to Cloudinary'));
                        } else {
                            resolve(result);
                        }
                    }
                );
                uploadStream.end(req.files.image[0].buffer);
            });
            imageUrl = imageResult.secure_url;
        }

        // If the request includes a video file, upload it to Cloudinary
        if (req.files && req.files.video) {
            const videoResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'package_videos', resource_type: 'video' },
                    (error, result) => {
                        if (error) {
                            reject(new Error('Failed to upload video to Cloudinary'));
                        } else {
                            resolve(result);
                        }
                    }
                );
                uploadStream.end(req.files.video[0].buffer);
            });
            videoUrl = videoResult.secure_url;
        }

        // Save the price and priceAfterDiscount as strings
        const newPackage = await Package.create({
            title,
            description,
            price: formatToTwoDecimals(price), // Store price as a string
            priceAfterDiscount: formatToTwoDecimals(priceAfterDiscount || price), // Store priceAfterDiscount as a string
            imageUrl,
            videoUrl,
            packageFeatures: packageFeatures ? packageFeatures.split(',').map(feature => feature.trim()) : []
        });

        res.status(201).json({ success: true, data: newPackage });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Edit an existing package
exports.editPackage = async (req, res) => {
    const { title, description, price, priceAfterDiscount } = req.body;

    try {
        const package = await Package.findById(req.params.id);

        if (!package) {
            return res.status(404).json({ success: false, error: 'Package not found' });
        }

        // Update fields
        package.title = title || package.title;
        package.description = description || package.description;

        // Update price and priceAfterDiscount as strings
        if (price) {
            package.price = formatToTwoDecimals(price); // Update price as a string
        }

        if (priceAfterDiscount !== undefined && priceAfterDiscount <= price) {
            package.priceAfterDiscount = formatToTwoDecimals(priceAfterDiscount); // Update priceAfterDiscount as a string
        } else if (priceAfterDiscount > price) {
            return res.status(400).json({
                success: false,
                error: 'Price after discount cannot be greater than the original price.',
            });
        }

        await package.save();

        res.status(200).json({ success: true, data: package });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Get all packages
exports.getPackages = async (req, res) => {
    try {
        const packages = await Package.find();

        res.status(200).json({ success: true, data: packages });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Get a single package by ID
exports.getPackage = async (req, res) => {
    try {
        const package = await Package.findById(req.params.id);

        if (!package) {
            return res.status(404).json({ success: false, error: 'Package not found' });
        }

        res.status(200).json({ success: true, data: package });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Delete a package
exports.deletePackage = async (req, res) => {
    try {
        const package = await Package.findByIdAndDelete(req.params.id);

        if (!package) {
            return res.status(404).json({ success: false, error: 'Package not found' });
        }

        res.status(200).json({ success: true, message: 'Package deleted successfully' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
