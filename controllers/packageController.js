
const Package = require('../models/Package');
const cloudinary = require('../utils/cloudinaryConfig');

// Add a new package
exports.addPackage = async (req, res) => {
    const { title, description, price } = req.body;

    try {
        let imageUrl = null; // Initialize imageUrl as null

        // If the request includes an image file, upload it to Cloudinary
        if (req.file) {
            // Upload file buffer to Cloudinary using a promise
            const result = await new Promise((resolve, reject) => {
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
                // Pass the file buffer to Cloudinary upload stream
                uploadStream.end(req.file.buffer);
            });

            imageUrl = result.secure_url; // Assign Cloudinary URL after upload
        }

        // Create the new package
        const newPackage = await Package.create({
            title,
            description,
            price,
            imageUrl, // Store the Cloudinary URL
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
