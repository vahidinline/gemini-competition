const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  userInput: {
    type: String,
    required: true,
  },
  nutrients: {
    type: Object, // Assuming the nutrients will be stored as an object
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FoodItem = mongoose.model('FoodItem', foodItemSchema);

module.exports = FoodItem;
