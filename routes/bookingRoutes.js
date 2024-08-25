const express = require('express');
const { createBooking, getBookings, updateBookingStatus, deleteBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').post(protect, createBooking).get(protect, getBookings);
router.route('/:id').put(protect, updateBookingStatus).delete(protect, deleteBooking);

module.exports = router;
