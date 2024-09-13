const express = require('express');
const multer = require('multer');
const { addPackage, getPackages, editPackage, deletePackage } = require('../controllers/packageController');
const { protect } = require('../middleware/authMiddleware');

// Configure Multer to store uploaded files in memory
const storage = multer.memoryStorage(); // Temporarily hold files in memory

// Initialize Multer with the memory storage configuration
const upload = multer({
    storage: storage, // Memory storage
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

const router = express.Router();

// Routes using the `upload.single('image')` middleware for Cloudinary uploads
router.route('/')
    .post(protect, upload.single('image'), addPackage)  // Handle Cloudinary upload inside the controller
    .get(protect, getPackages);
    
router.route('/:id')
    .put(protect, upload.single('image'), editPackage)
    .delete(protect, deletePackage);

module.exports = router;
