const express = require('express');
const {
    getUserInfo,
    getUserScheduledEvents,
    createInviteLink
} = require('../controllers/calendlyController');

const router = express.Router();

// Route to get Calendly user info
router.get('/user-info', getUserInfo);

// Route to get scheduled events for the user
router.get('/user-scheduled-events', getUserScheduledEvents);

// Route to create an invite link for an event
router.post('/invite', createInviteLink);

module.exports = router;
