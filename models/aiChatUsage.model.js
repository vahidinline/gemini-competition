const mongoose = require('mongoose');

const aiChatUsageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userType: {
    type: String, // 'free' or 'paid'
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  tokensUsed: {
    type: Number,
    required: true,
  },
  requestDetails: {
    // You can store additional information about the API request if needed
    // For example, user's input, model configuration, etc.
    type: mongoose.Schema.Types.Mixed,
  },
});

const AiChatUsage = mongoose.model('AiChatUsage', aiChatUsageSchema);

module.exports = AiChatUsage;
