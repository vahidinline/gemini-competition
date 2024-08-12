const mongoose = require('mongoose');

const aiChatConversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  input: {
    type: String,
    required: true,
  },
  output: {
    type: String,
    required: true,
  },
  tokensUsed: {
    type: Number,
    required: true,
  },
  userRate: {
    type: Boolean,
    required: false,
  },
  conversationDetails: {
    // Additional details about the conversation if needed
    type: mongoose.Schema.Types.Mixed,
  },
});

const AIChatConversation = mongoose.model(
  'AiChatConversation',
  aiChatConversationSchema
);

module.exports = AIChatConversation;
