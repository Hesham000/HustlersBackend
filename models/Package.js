const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },  // Original Price
    discountPercent: { type: Number, default: 0, min: 0, max: 100 }, // Discount Percentage
    priceAfterDiscount: { type: Number, min: 0 }, // Calculated Price after Discount
    packageFeatures: [{ type: String, trim: true }], // Array of Features
    imageUrl: { type: String, trim: true },
    slug: { type: String, unique: true },  // SEO-friendly URLs
    createdAt: { type: Date, default: Date.now }
});

// Middleware to calculate the price after discount before saving
PackageSchema.pre('save', function (next) {
    if (this.discountPercent > 0) {
        this.priceAfterDiscount = this.price - (this.price * this.discountPercent / 100);
    } else {
        this.priceAfterDiscount = this.price;
    }
    next();
});

module.exports = mongoose.model('Package', PackageSchema);
