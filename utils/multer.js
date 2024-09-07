const multer = require('multer');
const path = require('path');

// Configure Multer to store the uploaded file temporarily in memory
const storage = multer.memoryStorage();

// File filter to only allow image files (JPEG, PNG)
const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only .jpeg, .jpg, .png image formats are allowed!'));
    }
};

// Set up the Multer middleware for handling file uploads
const upload = multer({
    storage: storage, // Temporary storage in memory
    limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5 MB
    fileFilter: fileFilter
});

module.exports = upload;
