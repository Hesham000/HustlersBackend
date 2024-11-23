const Calendly = require('../models/Calendly');

// Save a Calendly link
exports.saveEventLink = async (req, res) => {
  try {
    const { eventLink } = req.body;

    if (!eventLink) {
      return res.status(400).json({ error: 'Event link is required' });
    }

    const newLink = new Calendly({ eventLink });
    await newLink.save();

    return res.status(201).json({ message: 'Event link saved successfully', data: newLink });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Event link already exists' });
    }
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Get the latest Calendly link
exports.getEventLink = async (req, res) => {
  try {
    const latestLink = await Calendly.findOne().sort({ createdAt: -1 });

    if (!latestLink) {
      return res.status(404).json({ error: 'No event link found' });
    }

    return res.status(200).json({ data: latestLink });
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
};
