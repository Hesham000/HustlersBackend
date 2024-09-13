// models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to user collection
    sentAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    firebaseToken: { type: String, required: true }, // FCM Token of recipient
});

module.exports = mongoose.model('Notification', NotificationSchema);
