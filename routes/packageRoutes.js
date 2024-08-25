const express = require('express');
const multer = require('multer');
const path = require('path');
const { addPackage, getPackages, editPackage, deletePackage } = require('../controllers/packageController');
const { protect } = require('../middleware/authMiddleware');

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify upload directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Initialize multer with the storage configuration
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        console.log('Field name received:', file.fieldname); // Debugging: log the field name
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});



const router = express.Router();

// Routes using the `upload.single('image')` middleware
router.route('/')
    .post(protect, upload.single('image'), addPackage)  // 'image' must match the key name in Postman
    .get(protect, getPackages);
    
router.route('/:id')
    .put(protect, upload.single('image'), editPackage)
    .delete(protect, deletePackage);

module.exports = router;
