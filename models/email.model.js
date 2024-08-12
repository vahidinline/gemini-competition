//create email sshema model
const mongoose = require('mongoose');
const Schema = mongoose.Schema({
  id: String,
  email: Array,
  recipient: [mongoose.Schema.Types.Mixed],
  subject: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  sender: String,
});
module.exports = mongoose.model('emails', Schema);
