const express = require('express');
const { createPayment, getPayments, getPaymentById, updatePaymentStatus } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').post(protect, createPayment).get(protect, getPayments);
router.route('/:id').get(protect, getPaymentById).put(protect, updatePaymentStatus);

module.exports = router;
