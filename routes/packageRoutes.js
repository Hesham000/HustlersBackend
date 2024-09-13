const express = require('express');
const multer = require('multer');
const { addPackage, editPackage, getPackages, deletePackage } = require('../controllers/packageController'); // Correct import
const { protect } = require('../middleware/authMiddleware');

// Configure Multer to store uploaded files in memory
const storage = multer.memoryStorage();

// Initialize Multer with memory storage and file filter
const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 50 MB limit for images and videos
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed!'), false);
        }
    }
});

const router = express.Router();

// Add routes for creating, getting, editing, and deleting packages
router.route('/')
    .post(protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), addPackage)
    .get(protect, getPackages); // Make sure getPackages is correctly referenced here

router.route('/:id')
    .put(protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), editPackage)
    .delete(protect, deletePackage);

module.exports = router;
