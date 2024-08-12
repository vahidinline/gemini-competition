const mongoose = require('mongoose');

const LogErrorSchema = new mongoose.Schema({
  error: String,
  date: { type: Date, default: Date.now },
  userId: String,
  errorData: Object,
});

module.exports = mongoose.model('LogError', LogErrorSchema);

// Path: middleware/aiRequestOpenAi.js
