const axios = require('axios');

// Base URL for Calendly API
const CALENDLY_BASE_URL = 'https://api.calendly.com';
const CALENDLY_API_KEY = process.env.CALENDLY_API_KEY;

// Configure axios instance with Calendly API headers
const calendly = axios.create({
    baseURL: CALENDLY_BASE_URL,
    headers: {
        Authorization: `Bearer ${CALENDLY_API_KEY}`,
        'Content-Type': 'application/json',
    },
});

// Get User Information to Retrieve User or Organization URI
exports.getUserInfo = async () => {
    try {
        const response = await calendly.get('/users/me');
        console.log('User Info:', response.data); // Debugging log
        return response.data;
    } catch (error) {
        console.error('Error fetching Calendly user info:', error.response?.data || error.message);
        throw error;
    }
};

// Fetch Scheduled Events Using User or Organization URI
exports.getScheduledEvents = async (uri, isOrganization = false) => {
    try {
        const params = isOrganization ? { organization: uri } : { user: uri };
        const response = await calendly.get('/scheduled_events', { params });
        console.log('Scheduled Events:', response.data); // Log response for debugging
        return response.data;
    } catch (error) {
        console.error('Error fetching scheduled events:', error.response?.data || error.message);
        throw error;
    }
};

// Create an Invite Link for an Event
exports.createInviteLink = async (eventUri, inviteeName, inviteeEmail) => {
    try {
        const response = await calendly.post(`${eventUri}/invitees`, {
            invitee: {
                name: inviteeName,
                email: inviteeEmail,
            },
        });
        console.log('Invite Link Data:', response.data); // Debugging log
        return response.data;
    } catch (error) {
        console.error('Error creating invite link:', error.response?.data || error.message);
        throw error;
    }
};
