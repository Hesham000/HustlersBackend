// routes/orderRoutes.js
const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
    createOrder,
    getAllOrders,
    getUserOrders,
    updateOrderStatus,
    deleteOrder,
} = require('../controllers/orderController');

const router = express.Router();

// Create a new order (for API/Flutter) - Protected Route
router.post('/', protect, createOrder);

// Get all orders (for Admin Dashboard) - Protected and Admin Only
router.get('/', protect, restrictTo('admin'), getAllOrders);

// Get user-specific orders (for User Profile/Dashboard)
router.get('/user/:userId', protect, getUserOrders);

// Update order status (Admin Only)
router.put('/:orderId', protect, restrictTo('admin'), updateOrderStatus);

// Delete an order (Admin Only)
router.delete('/:orderId', protect, restrictTo('admin'), deleteOrder);

module.exports = router;
