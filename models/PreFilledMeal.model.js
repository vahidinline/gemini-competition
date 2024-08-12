const mongoose = require('mongoose');

const PreFilledFoodItemSchema = new mongoose.Schema({
  food_item: String,
  persian_name: String,
  cuisine: String,
  serving_size: String,
  calories: {
    amount: Number,
    unit: String,
  },
  total_fat: {
    amount: Number,
    unit: String,
  },
  saturated_fat: {
    amount: Number,
    unit: String,
  },
  cholesterol: {
    amount: Number,
    unit: String,
  },
  sodium: {
    amount: Number,
    unit: String,
  },
  total_carbohydrates: {
    amount: Number,
    unit: String,
  },
  dietary_fiber: {
    amount: Number,
    unit: String,
  },
  sugars: {
    amount: Number,
    unit: String,
  },
  protein: {
    amount: Number,
    unit: String,
  },
  vitamins_and_minerals: {
    vitamin_a: {
      amount: Number,
      unit: String,
    },
    vitamin_c: {
      amount: Number,
      unit: String,
    },
    calcium: {
      amount: Number,
      unit: String,
    },
    iron: {
      amount: Number,
      unit: String,
    },
  },
  ingredients: [String],
  description: String,
});

module.exports = mongoose.model('PreFilledFoodItem', PreFilledFoodItemSchema);
