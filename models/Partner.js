const mongoose = require('mongoose');

const PartnerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Partner', PartnerSchema);