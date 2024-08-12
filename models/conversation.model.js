const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  user_Id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  created_At: {
    type: Date,
    required: true,
  },
  updated_At: {
    type: Date,
    required: true,
  },
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
