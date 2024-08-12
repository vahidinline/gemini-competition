const mongoose = require('mongoose');

const appSupportSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true,
  },
  userName: String,
  userId: String,
  userEmail: String,
  date: {
    type: Date,
    default: Date.now,
  },
  description: String,
  deviceName: String,
  path: String,
  status: {
    type: String,
    default: 'pending',
  },
  topic: String,
  reply: [
    {
      reply: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const AppSupport = mongoose.model('AppSupport', appSupportSchema);

module.exports = AppSupport;
