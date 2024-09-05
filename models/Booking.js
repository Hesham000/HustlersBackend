const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true, index: true },
    bookingDate: { 
        type: Date, 
        required: true,
        validate: {
            validator: function(value) {
                return value >= Date.now();
            },
            message: 'Booking date cannot be in the past'
        }
    },
    status: { type: String, required: true, enum: ['pending', 'confirmed', 'cancelled'] },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', BookingSchema);