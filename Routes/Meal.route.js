const axios = require('axios');
const express = require('express');
const router = express.Router();
const Meal = require('../models/meal.model');

// Step 1: Extract food items and amounts

router.post('/add', async (req, res) => {
  const { meal, userId } = req.body;
  try {
    const newMeal = new Meal({
      userId,
      mealName: meal,
      foodItems: [],
    });
    await newMeal.save();
    res.status(201).json({ message: 'Meal initialted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
