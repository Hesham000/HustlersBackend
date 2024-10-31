const express = require('express');
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../utils/multer');  // Multer middleware for file uploads

const router = express.Router();

// Route to get all users - only accessible by admin users
router.route('/')
    .get(protect, restrictTo('admin'), getUsers);

// Routes to get a specific user, update (with image upload), or delete a user by ID
router.route('/:id')
    .get(protect, restrictTo('admin', 'user'), getUserById)
    .put(
        protect, 
        restrictTo('admin', 'user'), 
        upload.single('image'), // Handle optional image upload with Multer
        updateUser  // Proceed with user update
    )
    .delete(protect, restrictTo('admin', 'user'), deleteUser);

    //(admin only)

module.exports = router;
