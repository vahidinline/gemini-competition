const mongoose = require('mongoose');

const DailyCalorie = mongoose.model(
  'DailyCalorie',
  new mongoose.Schema({
    userId: String,
    date: { type: Date, default: Date.now },
    calories: Number,
    carbsPercent: Number,
    proteinsPercent: Number,
    fatsPercent: Number,
    fatGrams: Number,
    proteinGrams: Number,
    carbsGrams: Number,
  })
);

module.exports = DailyCalorie;
// Path: models/index.js
