const User = require('../models/User');
const Payment = require('../models/Payment');
const Package = require('../models/Package');
const Booking = require('../models/Booking');

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
                    totalRevenue: { $sum: '$amount' },
                    totalPayments: { $sum: 1 },  // Track total payments for growth rate calculation
                    totalBookings: { $sum: 1 },  // For calculating average revenue per booking
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

        // 7. Calculate Average Revenue Per Booking
        const averageRevenuePerBooking = totalRevenue.map(rev => ({
            year: rev._id.year,
            month: rev._id.month,
            averageRevenue: rev.totalRevenue / rev.totalBookings || 0
        }));

        // 8. Calculate Bookings, Revenue, and Payment Growth Rate (Month-over-Month percentage change)
        const calculateGrowthRate = (data, key) => {
            const growth = [];
            for (let i = 1; i < data.length; i++) {
                const previous = data[i - 1][key];
                const current = data[i][key];
                const growthRate = previous > 0 ? ((current - previous) / previous) * 100 : 0;
                growth.push({
                    year: data[i]._id.year,
                    month: data[i]._id.month,
                    growthRate: growthRate.toFixed(2)
                });
            }
            return growth;
        };

        // Bookings Growth Rate
        const bookingsGrowthRate = calculateGrowthRate(totalBookings, 'totalBookings');

        // Revenue Growth Rate
        const revenueGrowthRate = calculateGrowthRate(totalRevenue, 'totalRevenue');

        // Payment Growth Rate
        const paymentGrowthRate = calculateGrowthRate(totalRevenue, 'totalPayments');  // Use totalPayments for payment growth

        // Sending the response with analytics data
        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalRevenue,
                totalPackages,
                totalBookings,
                userGrowth,
                packageDistribution,
                averageRevenuePerBooking,
                bookingsGrowthRate,
                revenueGrowthRate,
                paymentGrowthRate  // Include payment growth rate
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
