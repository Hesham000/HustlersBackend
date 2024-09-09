// controllers/analyticsController.js

const User = require('../models/User');
const Payment = require('../models/Payment');
const Package = require('../models/Package');
const Booking = require('../models/Booking');

// Get analytics data
exports.getAnalytics = async (req, res) => {
    try {
        // 1. Total Users
        const totalUsers = await User.countDocuments();

        // 2. Total Revenue (sum of all completed payments)
        const totalRevenue = await Payment.aggregate([
            { $match: { status: 'completed' } }, // Only completed payments
            { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
        ]);

        // 3. Total Packages
        const totalPackages = await Package.countDocuments();

        // 4. Total Bookings
        const totalBookings = await Booking.countDocuments();

        // 5. Revenue Trends (revenue per month for the last 12 months)
        const revenueTrends = await Payment.aggregate([
            { $match: { status: 'completed' } }, // Only completed payments
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    revenue: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 6. User Growth (new users per month for the last 12 months)
        const userGrowth = await User.aggregate([
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    newUsers: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 7. Package Subscription Distribution (number of bookings per package)
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
                totalRevenue: totalRevenue[0]?.totalRevenue || 0, // Avoid undefined if no revenue
                totalPackages,
                totalBookings,
                revenueTrends,
                userGrowth,
                packageDistribution
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
