const express = require('express');
const axios = require('axios');

const app = express();
const router = express.Router();

const DailyCalories = require('../models/dailyCalorie.model');

router.post('/api/daily-goal', async (req, res) => {
  const {
    dailyCalories,
    fatPercentage,
    proteinPercentage,
    carbsPercentage,
    fatGrams,
    proteinGrams,
    carbsGrams,
    userId,
  } = req.body;

  const dailyCalorie = new DailyCalories({
    userId,
    calories: dailyCalories,
    carbsPercent: carbsPercentage,
    proteinsPercent: proteinPercentage,
    fatsPercent: fatPercentage,
    fatGrams: fatGrams,
    proteinGrams: proteinGrams,
    carbsGrams: carbsGrams,
  });

  try {
    await dailyCalorie.save();
    res.json(dailyCalorie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/api/daily-calories', async (req, res) => {
  const { userId, date } = req.query;

  try {
    const dailyCalories = await DailyCalories.find({ userId, date });
    res.json(dailyCalories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/api/calorie-report/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const dailyCalories = await DailyCalories.findById(id);
    res.json(dailyCalories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
