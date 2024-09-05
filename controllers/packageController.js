
const Package = require('../models/Package');
const fs = require('fs');

// Add a new package
exports.addPackage = async (req, res) => {
    const { title, description, price } = req.body;

    try {
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const newPackage = await Package.create({
            title,
            description,
            price,
            imageUrl,
        });

        res.status(201).json({ success: true, data: newPackage });
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

// Edit an existing package
exports.editPackage = async (req, res) => {
    const { title, description, price } = req.body;

    try {
        const package = await Package.findById(req.params.id);

        if (!package) {
            return res.status(404).json({ success: false, error: 'Package not found' });
        }

        const imageUrl = req.file ? `/uploads/${req.file.filename}` : package.imageUrl;

        package.title = title || package.title;
        package.description = description || package.description;
        package.price = price || package.price;
        package.imageUrl = imageUrl;

        await package.save();

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

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
