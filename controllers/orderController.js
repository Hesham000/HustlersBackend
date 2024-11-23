const Order = require('../models/Order');
const User = require('../models/User');
const Package = require('../models/Package');

// Create a new order (for API/Flutter)
exports.createOrder = async (req, res) => {
    try {
        const { user_id, package_id, amount, discount, total_amount, payment_status, order_status } = req.body;

        // Validate request body
        if (!user_id || !package_id || !amount || !total_amount) {
            return res.status(400).json({ success: false, message: 'All required fields must be provided' });
        }

        // Create a new order
        const newOrder = await Order.create({
            user_id,
            package_id,
            amount,
            discount,
            total_amount,
            payment_status,
            order_status,
        });

        res.status(201).json({ success: true, data: newOrder });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Get all orders (for Admin/Dashboard)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user_id', 'name email')  // Populate user details (name, email)
            .populate('package_id', 'title price');  // Populate package details (title, price)

        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Get orders for a specific user (for User Profile/Dashboard)
exports.getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;  // Extract user ID from URL params

        const orders = await Order.find({ user_id: userId })
            .populate('package_id', 'title price');

        if (!orders.length) {
            return res.status(404).json({ success: false, message: 'No orders found for this user' });
        }

        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Update order status (for Admin/Dashboard)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { order_status, payment_status } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { order_status, payment_status },
            { new: true }  // Return the updated document
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({ success: true, data: updatedOrder });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Delete an order (for Admin/Dashboard)
exports.deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const deletedOrder = await Order.findByIdAndDelete(orderId);

        if (!deletedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
