const Booking = require('../models/Booking');

// Create a Booking
exports.createBooking = async (req, res) => {
    const { user, package, bookingDate } = req.body;
    try {
        const newBooking = await Booking.create({ user, package, bookingDate, status: 'pending' });
        res.status(201).json({ success: true, data: newBooking });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Get All Bookings
exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('user').populate('package');
        res.status(200).json({ success: true, data: bookings });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Update Booking Status
exports.updateBookingStatus = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, {
            new: true,
            runValidators: true,
        });
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }
        res.status(200).json({ success: true, data: booking });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Delete Booking
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
