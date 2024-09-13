// routes/partnerRoutes.js
const express = require('express');
const multer = require('multer');
const { addPartner, getPartners, deletePartner } = require('../controllers/partnerController');
const { protect } = require('../middleware/authMiddleware');

// Configure Multer to store uploaded files in memory
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Routes using Multer for logo upload
router.route('/')
    .post(protect, upload.single('logo'), addPartner)  // 'logo' must match the key name in Postman
    .get(getPartners);

router.route('/:id')
    .delete(protect, deletePartner);

module.exports = router;
