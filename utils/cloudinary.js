const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for handling file uploads locally before uploading to Cloudinary
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save files temporarily to 'uploads/' folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// Upload image to Cloudinary
const uploadToCloudinary = (filePath) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(filePath, (result, error) => {
            if (error) return reject(error);
            // Resolve the URL of the uploaded image
            resolve(result.secure_url);
        });
    });
};

// Helper function to delete the local file after uploading to Cloudinary
const deleteLocalFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) console.error('Failed to delete local file:', err);
    });
};

module.exports = { upload, uploadToCloudinary, deleteLocalFile };
