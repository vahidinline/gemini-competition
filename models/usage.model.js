const mongoose = require('mongoose');

const UsageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestsMade: { type: Number, default: 0 },
  remainingUsage: { type: Number, default: 1000 }, // Set default limit as per your requirements
});

module.exports = mongoose.model('Usage', UsageSchema);
