const User = require('../models/User');

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

// Update User
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

        // Find user and update
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,  // Ensure schema validators are applied
        });

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
