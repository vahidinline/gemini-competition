const Meal = require('../models/meal.model');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    let { date } = req.query;

    console.log('userId', userId);
    console.log('date', date);

    // Convert the date from query to a Date object, assuming it's passed as a string in 'YYYY-MM-DD' format
    const startOfPeriod = new Date(date);
    startOfPeriod.setHours(0, 0, 0, 0);

    const endOfPeriod = new Date(date);
    endOfPeriod.setHours(23, 59, 59, 999);

    // Fetch the meals for the user and date range with status 'approved'
    const result = await Meal.find({
      userId: userId,
      date: {
        $gte: startOfPeriod,
        $lt: endOfPeriod,
      },
      status: 'approved',
    });

    console.log('Fetched meals:', result);

    // Calculate total nutritional values for each meal and aggregate by meal name
    const totalNutritionalValues = result.map((meal) => {
      const totalValues = meal.foodItems.reduce(
        (acc, foodItem) => {
          acc.calories += parseFloat(foodItem.calories.amount) || 0;
          acc.totalCarbs +=
            parseFloat(foodItem.total_carbohydrates.amount) || 0;
          acc.totalFat += parseFloat(foodItem.total_fat.amount) || 0;
          acc.protein += parseFloat(foodItem.protein.amount) || 0;
          acc.sugars += parseFloat(foodItem.sugars.amount) || 0;
          acc.dietaryFiber += parseFloat(foodItem.dietary_fiber.amount) || 0;
          return acc;
        },
        {
          calories: 0,
          totalCarbs: 0,
          totalFat: 0,
          protein: 0,
          sugars: 0,
          dietaryFiber: 0,
        }
      );

      return {
        name: meal.mealName,
        totalCalories: totalValues.calories,
        totalCarbs: totalValues.totalCarbs,
        totalFat: totalValues.totalFat,
        totalProteins: totalValues.protein,
        totalSugars: totalValues.sugars,
        totalFibers: totalValues.dietaryFiber,
      };
    });

    console.log('Total nutritional values:', totalNutritionalValues);

    // Aggregate the nutritional values by meal name
    const aggregatedNutritionalValues = totalNutritionalValues.reduce(
      (acc, meal) => {
        if (!acc[meal.name]) {
          acc[meal.name] = {
            totalCalories: 0,
            totalCarbs: 0,
            totalFat: 0,
            totalProteins: 0,
            totalSugars: 0,
            totalFibers: 0,
          };
        }
        acc[meal.name].totalCalories += meal.totalCalories;
        acc[meal.name].totalCarbs += meal.totalCarbs;
        acc[meal.name].totalFat += meal.totalFat;
        acc[meal.name].totalProteins += meal.totalProteins;
        acc[meal.name].totalSugars += meal.totalSugars;
        acc[meal.name].totalFibers += meal.totalFibers;
        return acc;
      },
      {}
    );

    console.log('Aggregated nutritional values:', aggregatedNutritionalValues);

    // Convert the aggregated data to an array format for the response
    const aggregatedNutritionalValuesArray = Object.keys(
      aggregatedNutritionalValues
    ).map((name) => ({
      name: name,
      totalCalories: aggregatedNutritionalValues[name].totalCalories,
      totalCarbs: aggregatedNutritionalValues[name].totalCarbs,
      totalFat: aggregatedNutritionalValues[name].totalFat,
      totalProteins: aggregatedNutritionalValues[name].totalProteins,
      totalSugars: aggregatedNutritionalValues[name].totalSugars,
      totalFibers: aggregatedNutritionalValues[name].totalFibers,
    }));

    console.log(
      'aggregatedNutritionalValuesArray',
      aggregatedNutritionalValuesArray
    );
    res.status(200).json({
      data: result,
      aggregatedNutritionalValues: aggregatedNutritionalValuesArray,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

module.exports = router;
