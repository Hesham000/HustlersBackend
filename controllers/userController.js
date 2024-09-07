const User = require('../models/User');
const { cloudinary } = require('../utils/cloudinary');

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

// Create or Update User with Image Upload
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

        // Handle image upload if a file is present
        let imageUrl;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'user_images', 
                use_filename: true,
                unique_filename: false,
                overwrite: true
            });
            imageUrl = result.secure_url; 
        }

        // Find user and update, including the image URL if provided
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                name,
                email,
                phone,
                ...(imageUrl && { image: imageUrl })  // Only update image if uploaded
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user
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
