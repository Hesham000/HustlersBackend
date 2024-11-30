const User = require('../models/User');
const cloudinary = require('../utils/cloudinaryConfig'); // Import Cloudinary configuration

// Get All Users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server error, failed to fetch users.',
            details: err.message
        });
    }
};

// Get User by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: 'Invalid user ID format.',
            details: err.message
        });
    }
};

// Update User with Cloudinary Image Upload
exports.updateUser = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        // Validate required fields
        if (!name || !email || !phone) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, and phone are required fields.'
            });
        }

        let imageUrl;
        if (req.file) {
            // Upload image to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'user_images',  // Optional folder on Cloudinary
                use_filename: true
            });

            imageUrl = result.secure_url; // Cloudinary image URL
        }

        // Update user with new data
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                name,
                email,
                phone,
                ...(imageUrl && { image: imageUrl })  // Update image only if provided
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            error: 'Failed to update user.',
            details: err.message
        });
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: {}
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: 'Failed to delete user.',
            details: err.message
        });
    }
};
