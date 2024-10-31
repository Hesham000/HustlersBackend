const calendlyService = require('../services/calendlyService');

// Get Calendly User Info
exports.getUserInfo = async (req, res) => {
    try {
        const data = await calendlyService.getUserInfo();
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error fetching user info:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch Calendly user info.' });
    }
};

// Get User Scheduled Events
exports.getUserScheduledEvents = async (req, res) => {
    try {
        // Step 1: Fetch user info to determine URI context
        const userInfo = await calendlyService.getUserInfo();
        const organizationUri = userInfo.resource.current_organization;
        const userUri = userInfo.resource.uri;
        const uriToUse = organizationUri || userUri;
        const isOrganization = Boolean(organizationUri);

        console.log(`Using ${isOrganization ? 'Organization' : 'User'} URI: ${uriToUse}`); // Log URI type

        // Step 2: Fetch scheduled events using the determined URI
        const events = await calendlyService.getScheduledEvents(uriToUse, isOrganization);

        if (!events.collection || events.collection.length === 0) {
            console.warn('No events found for this user or organization');
            return res.status(404).json({ success: false, message: 'No events found for this user or organization.' });
        }

        res.status(200).json({ success: true, data: events });
    } catch (error) {
        console.error('Error fetching scheduled events:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to retrieve scheduled events.' });
    }
};

// Create an Invite Link for an Event
exports.createInviteLink = async (req, res) => {
    try {
        const { name, email } = req.body;

        // Step 1: Fetch user info and URI for the authenticated user
        const userInfo = await calendlyService.getUserInfo();
        const organizationUri = userInfo.resource.current_organization;
        const userUri = userInfo.resource.uri;
        const uriToUse = organizationUri || userUri;
        const isOrganization = Boolean(organizationUri);

        // Step 2: Fetch scheduled events for the user or organization
        const events = await calendlyService.getScheduledEvents(uriToUse, isOrganization);

        if (!events.collection || events.collection.length === 0) {
            return res.status(404).json({ success: false, message: 'No events available for invitation.' });
        }

        // Step 3: Use the first available event's URI to create an invite link
        const eventUri = events.collection[0].uri;
        const inviteData = await calendlyService.createInviteLink(eventUri, name, email);

        res.status(201).json({ success: true, data: inviteData });
    } catch (error) {
        console.error('Error creating invite link:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to create invite link.' });
    }
};
