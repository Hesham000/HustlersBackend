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

// Multer configuration for handling file uploads (store files temporarily on disk)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // Temporary storage before uploading to Cloudinary
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Upload to Cloudinary function
const uploadToCloudinary = (localFilePath) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(localFilePath, { folder: 'user_images' }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }

            // After uploading, delete the file from the local filesystem
            fs.unlinkSync(localFilePath);
        });
    });
};

// Middleware for handling file uploads and Cloudinary upload
const handleFileUpload = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        // Upload the file to Cloudinary
        const localFilePath = path.join(__dirname, '../uploads/', req.file.filename);
        const result = await uploadToCloudinary(localFilePath);

        // Attach the Cloudinary result to the request object
        req.file.cloudinaryUrl = result.secure_url;
        next();
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error.message);
        res.status(500).send('Error uploading file.');
    }
};

module.exports = { upload, handleFileUpload };
