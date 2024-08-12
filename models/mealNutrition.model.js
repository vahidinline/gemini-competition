const mongoose = require('mongoose');

const NutritionSchema = new mongoose.Schema({
  name: String,
  calories: Number,
  serving_size_g: Number,
  fat_total_g: Number,
  fat_saturated_g: Number,
  protein_g: Number,
  sodium_mg: Number,
  potassium_mg: Number,
  cholesterol_mg: Number,
  carbohydrates_total_g: Number,
  fiber_g: Number,
  sugar_g: Number,
});

module.exports = mongoose.model('MealNutrition', NutritionSchema);
