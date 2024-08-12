const mongoose = require('mongoose');

const Forms = {
  name: String,

  email: String,
  whatsapp: String,
  instagram: String,
  product: String,
  date: {
    type: Date,
    default: Date.now,
  },
  // reason : String,
  country: String,
  userWant: {
    type: Boolean,
    default: true,
  },
};

const FormSchema = mongoose.model('form', Forms);

module.exports = FormSchema;
