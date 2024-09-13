const multer = require('multer');

// Configure Multer to store the uploaded file in memory
const storage = multer.memoryStorage();

// File filter to only allow image files (JPEG, PNG)
const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(file.originalname.toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Only .jpeg, .jpg, .png image formats are allowed!'));
    }
};

// Initialize the upload middleware with limits
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
    fileFilter: fileFilter,
});

module.exports = upload;
