const mongoose = require('mongoose');

const UserInteractionSchema = new mongoose.Schema({
  userId: Number,
  MealId: String,
  username: String,
  userText: String,
  aiResponse: String,
  date: { type: Date, default: Date.now },
  approvedbyuser: Boolean,
  mealNutritionName: String,
  mealNutritionID: String,
});

const UserInteractionModel = mongoose.model(
  'UserInteraction',
  UserInteractionSchema
);

module.exports = UserInteractionModel;
