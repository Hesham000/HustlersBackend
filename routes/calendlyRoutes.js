const express = require('express');
const router = express.Router();
const calendlyController = require('../controllers/calendlyController');

router.post('/event-link', calendlyController.saveEventLink);

router.get('/event-link', calendlyController.getEventLink);

module.exports = router;
