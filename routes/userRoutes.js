const express = require('express');
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');  // Import the Multer middleware
const router = express.Router();

// Route to get all users - only accessible by admin users
router.route('/').get(protect, restrictTo('admin'), getUsers);

// Routes to get, update (with image upload), or delete a user by ID
router.route('/:id')
    .get(protect, restrictTo('admin', 'user'), getUserById)
    .put(protect, restrictTo('admin', 'user'), upload.single('image'), updateUser)  // Add upload middleware
    .delete(protect, restrictTo('admin', 'user'), deleteUser);

module.exports = router;
