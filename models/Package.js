const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, trim: true },
    slug: { type: String, unique: true },  // SEO-friendly URLs
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Package', PackageSchema);