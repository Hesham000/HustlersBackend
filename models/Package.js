const mongoose = require('mongoose');
const slugify = require('slugify');  

const PackageSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },  
    discountPercent: { type: Number, default: 0, min: 0, max: 100 }, 
    priceAfterDiscount: { type: Number, min: 0 }, 
    packageFeatures: { type: [String], default: [] }, 
    imageUrl: { type: String, trim: true },
    videoUrl: { type: String, trim: true },
    slug: { type: String, unique: true, trim: true },  // SEO-friendly URLs
    createdAt: { type: Date, default: Date.now }
});

// Middleware to calculate price after discount before saving
PackageSchema.pre('save', function (next) {
    if (this.discountPercent > 0) {
        // Ensure priceAfterDiscount is not negative
        this.priceAfterDiscount = Math.max(this.price - (this.price * this.discountPercent / 100), 0);
    } else {
        this.priceAfterDiscount = this.price;
    }

    // Automatically generate a slug from title if slug is not provided
    if (!this.slug && this.title) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    
    next();
});

// Middleware to update price after discount for `findOneAndUpdate` operations
PackageSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    
    if (update.price || update.discountPercent) {
        const price = update.price || this.price;
        const discountPercent = update.discountPercent || this.discountPercent;

        // Recalculate price after discount and update the document
        const priceAfterDiscount = discountPercent > 0 
            ? Math.max(price - (price * discountPercent / 100), 0)
            : price;

        this.set({ priceAfterDiscount });
    }

    next();
});

module.exports = mongoose.model('Package', PackageSchema);
