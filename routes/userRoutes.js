const express = require('express');
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');  // Import the Multer middleware for Cloudinary storage
const router = express.Router();

// Route to get all users - only accessible by admin users
router.route('/')
    .get(protect, restrictTo('admin'), getUsers);  // Admin can fetch all users

// Routes to get a specific user, update (with image upload), or delete a user by ID
router.route('/:id')
    .get(protect, restrictTo('admin', 'user'), getUserById)  // Admin or the user themselves can fetch user by ID
    .put(protect, restrictTo('admin', 'user'), upload.single('image'), updateUser)  // Admin or user can update with optional image upload
    .delete(protect, restrictTo('admin', 'user'), deleteUser);  // Admin or user can delete a user

module.exports = router;
