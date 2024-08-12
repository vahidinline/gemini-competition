const mongoose = require('mongoose');

const errorSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  code: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  userId: String,
});

const ErrorModel = mongoose.model('Error', errorSchema);

module.exports = ErrorModel;
