const User = require('../models/User');
const Package = require('../models/Package');

// Get analytics data
exports.getAnalytics = async (req, res) => {
    try {
        // 1. Total Users
        const totalUsers = await User.countDocuments();

        // 2. Total Packages
        const totalPackages = await Package.countDocuments();

        // 3. Total Payments
        const totalPayments = await Payment.countDocuments({ status: 'completed' });

        // 4. Monthly Users Growth (over the last 12 months)
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

        // 5. Monthly Payments Growth (over the last 12 months)
        const paymentGrowth = await Payment.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalPayments: { $sum: 1 },
                    totalRevenue: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // 6. Monthly Package Creation Growth (over the last 12 months)
        const packageGrowth = await Package.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalPackages: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // 7. Calculate growth rate for users, payments, and packages over time
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

        // Calculate growth rates
        const userGrowthRate = calculateGrowthRate(userGrowth, 'newUsers');
        const paymentGrowthRate = calculateGrowthRate(paymentGrowth, 'totalPayments');
        const packageGrowthRate = calculateGrowthRate(packageGrowth, 'totalPackages');

        // Sending the response with analytics data
        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalPackages,
                totalPayments,
                userGrowth,
                paymentGrowth,
                packageGrowth,
                userGrowthRate,
                paymentGrowthRate,
                packageGrowthRate
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
