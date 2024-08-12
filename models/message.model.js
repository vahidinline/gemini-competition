const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  conversation_Id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  agentType: {
    type: String,
    required: false,
  },
  agentModel: {
    type: String,
    required: false,
  },
  userRate: {
    type: Boolean,
    required: false,
  },
  role: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  created_At: {
    type: Date,
    required: true,
  },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
