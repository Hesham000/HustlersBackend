const mongoose = require('mongoose');
const slugify = require('slugify');

// Define the schema with price and priceAfterDiscount as strings
const PackageSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: String, required: true },  // Store price as a string
    priceAfterDiscount: { type: String, required: true },  // Store priceAfterDiscount as a string
    discountPercent: { type: String },  // Discount percent calculated automatically
    packageFeatures: { type: [String], default: [] },
    imageUrl: { type: String, trim: true },
    videoUrl: { type: String, trim: true },
    slug: { type: String, unique: true, trim: true },
    createdAt: { type: Date, default: Date.now }
});

// Middleware to calculate discountPercent before saving
PackageSchema.pre('save', function (next) {
    const price = parseFloat(this.price);
    const priceAfterDiscount = parseFloat(this.priceAfterDiscount);

    // Calculate discount percentage if price and priceAfterDiscount are available
    if (price > 0 && priceAfterDiscount < price) {
        const discountPercent = ((price - priceAfterDiscount) / price) * 100;
        this.discountPercent = discountPercent.toFixed(2); // Store as string with two decimals
    } else {
        this.discountPercent = "0.00";  // No discount
    }

    // Automatically generate a slug from title if slug is not provided
    if (!this.slug && this.title) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    
    next();
});

module.exports = mongoose.model('Package', PackageSchema);
