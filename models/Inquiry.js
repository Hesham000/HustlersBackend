const mongoose = require('mongoose');

// Define the Inquiry schema
const InquirySchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
    },
    question: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Export the Inquiry model
module.exports = mongoose.model('Inquiry', InquirySchema);
