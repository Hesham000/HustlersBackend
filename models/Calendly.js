const mongoose = require('mongoose');

// Define the schema
const calendlySchema = new mongoose.Schema({
  eventLink: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the model
const Calendly = mongoose.model('Calendly', calendlySchema);

module.exports = Calendly;
