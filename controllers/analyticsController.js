// controllers/analyticsController.js

const User = require('../models/User');
const Payment = require('../models/Payment');
const Package = require('../models/Package');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

// Get analytics data
exports.getAnalytics = async (req, res) => {
    try {
        // 1. Total Users
        const totalUsers = await User.countDocuments();

        // 2. Total Revenue (monthly aggregation over a specific duration, e.g., the last 12 months)
        const totalRevenue = await Payment.aggregate([
            { $match: { status: 'completed' } }, // Only completed payments
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalRevenue: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // 3. Total Packages
        const totalPackages = await Package.countDocuments();

        // 4. Total Bookings (monthly aggregation over a specific duration, e.g., the last 12 months)
        const totalBookings = await Booking.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalBookings: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // 5. User Growth (monthly aggregation for the last 12 months)
        const userGrowth = await User.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    newUsers: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // 6. Package Subscription Distribution (number of bookings per package)
        const packageDistribution = await Booking.aggregate([
            {
                $group: {
                    _id: '$package',
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { bookings: -1 } },
            {
                $lookup: {
                    from: 'packages', // Collection name
                    localField: '_id',
                    foreignField: '_id',
                    as: 'packageDetails'
                }
            }
        ]);

        // Sending the response with analytics data
        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalRevenue,
                totalPackages,
                totalBookings,
                userGrowth,
                packageDistribution
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};