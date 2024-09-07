const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'user_images',  // Cloudinary folder where images will be stored
        allowed_formats: ['jpeg', 'png', 'jpg'],
    },
});

// Multer middleware for handling file uploads
const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };
