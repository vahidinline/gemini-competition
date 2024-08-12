const axios = require('axios');
const express = require('express');
const router = express.Router();
const Meal = require('../models/meal.model');
const calculateTotalNutritionBetweenDates = require('../middleware/customReport');
const { customFoodFinder } = require('../middleware/customfood');
const foodExtractorGmini = require('./vertex');
const foodChecker = require('../middleware/foodchecker');
const LogErrorSchema = require('../models/ErrorLog.model');
const foodCheckerGmini = require('../middleware/foodChecker.Gemini');
const extractFoodItems = require('../middleware/nutritionFinder');
const storeFoodItem = require('../middleware/storeFoodItems');
const getsingleMealResult = require('../middleware/getSingleMealResult');
const { stat } = require('fs');

// Step 1: Extract food items and amounts

// Step 2: Get nutrition facts for each food item

const getNutritionFacts = async (foodItems, userId) => {
  const { name, amount, unit } = foodItems;

  const messages = [
    {
      role: 'system',
      content: `Please provide the nutrition facts for the following food item in valid JSON format, with the amount and unit for each nutrient specified separately. Include fields for food_item, serving_size, calories, total_fat, saturated_fat, cholesterol, sodium, total_carbohydrates, dietary_fiber, sugars, protein, and vitamins_and_minerals, with separate values for the amount and unit of each nutrient. For nutrients or vitamins and minerals, if specific information is not available, include the field with the amount as "N/A" and the unit field empty. Use error codes 500 for unclear requests and 404 for data not found.`,
    },
    {
      role: 'user',
      content: `${amount} - ${unit} of ${name}`,
    },
  ];

  const requestBody = {
    messages,
    temperature: 0,
    top_p: 0.7,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 1000,
  };

  try {
    const response = await axios.post(
      `${process.env.OPENAI_FOOD_API_ENDPOINT}`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_FOOD_API_KEY}`,
        },
      }
    );
    console.log('Finall result', response.data.choices[0].message.content); // Log the raw response
    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    const errorLog = new LogErrorSchema({
      error: error.message,
      userId: userId,
      errorData: error,
    });

    await errorLog.save();

    throw new Error('Error getting nutrition facts');
  }
};

//OLD Step 3: Process the user input and save data

//NEW get user input and process it
router.post('/', async (req, res) => {
  const data = req.body;
  const inputType = 'text';
  // Validate and check initial data structure
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  let userId, selectedMeal; // Declare these variables outside the try block for broader scope

  try {
    const results = [];

    // If data is not an array, wrap it in an array for uniform processing
    const dataArray = Array.isArray(data) ? data : [data];

    for (const item of dataArray) {
      const { userInput } = item; // Extract userInput from each item

      // Extract userId and selectedMeal only once if they are the same for all items
      if (!userId || !selectedMeal) {
        userId = item.userId;
        selectedMeal = item.selectedMeal;
      }

      console.log('userInput in route', userInput, userId, selectedMeal);

      // Validate the presence of essential fields
      if (!userInput || !userId || !selectedMeal) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const foodItems = await extractFoodItems(userInput, userId, selectedMeal);
      if (foodItems === null) {
        return res.status(500).json({ error: 'No food item found' });
      } else {
        results.push(foodItems);
      }
    }

    // Store the results using collected userId and selectedMeal
    const saveResult = await storeFoodItem(
      results,
      userId,
      selectedMeal,
      inputType
    );
    if (!saveResult) {
      return res.status(500).json({ error: 'Failed to save food items' });
    }
    console.log('saveResult', saveResult);
    const foodId = saveResult._id.toString();
    const getResult = await getsingleMealResult(userId, selectedMeal);
    if (getResult === null) {
      return res.status(500).json({ error: 'No food item found' });
    }

    // Successfully retrieved and stored food items
    console.log('got final Result', dataArray);
    res.json({
      currentFood: saveResult,
      status: 200,
      foodId: foodId,
      data: getResult,
      mealName: selectedMeal,
      foodItems: dataArray, // Changed to dataArray to represent all user inputs
    });
  } catch (error) {
    console.error(error.message);

    // Ensure userId and error details are accessible for logging
    try {
      if (userId) {
        // Log error only if userId is defined
        const errorLog = new LogErrorSchema({
          error: error.message,
          userId: userId,
          errorData: error,
        });
        await errorLog.save();
      }
    } catch (logError) {
      console.error('Failed to log error', logError);
    }

    // Send response after attempting to log the error
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/addfood', async (req, res) => {
  const { foodItems, userId, selectedMeal } = req.body;
  console.log('foodItems', foodItems);
  try {
    const nutritionFacts = await getNutritionFacts(foodItems, userId);
    console.log('nutritionFacts', nutritionFacts);

    const meal = new Meal({
      userId,
      mealName: selectedMeal,
      foodItems: nutritionFacts,
    });

    await meal.save();

    res.json({ nutritionFacts, mealId: meal._id });
  } catch (error) {
    const errorLog = new LogErrorSchema({
      error: error.message,
      userId: userId,
      errorData: error,
    });

    await errorLog.save();
    response.data.choices[0].message.content;
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function calculateTotalNutritionForDay(userId, date = new Date()) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const aggregateResult = await Meal.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startOfDay, $lte: endOfDay },
          status: 'approved',
        },
      },
      { $unwind: '$foodItems' },
      {
        $group: {
          _id: null,
          totalCalories: { $sum: { $toDouble: '$foodItems.calories.amount' } },
          totalFat: { $sum: { $toDouble: '$foodItems.total_fat.amount' } },
          totalProtein: { $sum: { $toDouble: '$foodItems.protein.amount' } },
          totalFiber: {
            $sum: { $toDouble: '$foodItems.dietary_fiber.amount' },
          },
          totalSodium: { $sum: { $toDouble: '$foodItems.sodium.amount' } },
          totalCarbs: {
            $sum: { $toDouble: '$foodItems.total_carbohydrates.amount' },
          },

          // Add other nutritional components as needed
        },
      },
    ]);

    console.log(aggregateResult);
    return aggregateResult;
  } catch (err) {
    const errorLog = new LogErrorSchema({
      error: err.message,
      userId: userId,
      errorData: err,
    });

    await errorLog.save();
    console.error(err);
    return null;
  }
}

router.get('/dailyreport/:id', async (req, res) => {
  const { id } = req.params;
  const date = new Date().toISOString().split('T')[0];
  //console.log('id in dailyreport', id);

  try {
    const totalNutrition = await calculateTotalNutritionForDay(id);

    res.json(totalNutrition);
  } catch (error) {
    const errorLog = new LogErrorSchema({
      error: error.message,
      userId: userId,
      errorData: error,
    });

    await errorLog.save();
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/weeklyreport/:id', async (req, res) => {
  const { id } = req.params;
  const date = new Date().toISOString().split('T')[0];
  console.log('id in weeklyreport', id);
  try {
    const totalNutrition = await calculateTotalNutritionForDay(id, date);
    res.json(totalNutrition);
  } catch (error) {
    const errorLog = new LogErrorSchema({
      error: error.message,
      userId: userId,
      errorData: error,
    });

    await errorLog.save();
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/customreport/', async (req, res) => {
  const { startDate, endDate, userId } = req.query;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysBetween = Math.floor((end - start) / (1000 * 60 * 60 * 24));

  try {
    const totalNutrition = await calculateTotalNutritionBetweenDates(
      userId,
      startDate,
      endDate,
      daysBetween
    );
    console.log('totalNutrition', totalNutrition);
    res.json({
      startDate,
      endDate,
      daysBetween,
      totalNutrition,
    });
  } catch (error) {
    const errorLog = new LogErrorSchema({
      error: error.message,
      userId: userId,
      errorData: error,
    });

    await errorLog.save();
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/update', async (req, res) => {
  const { status, foodId } = req.body;
  console.log('status, foodId', status, foodId);

  try {
    const meal = await Meal.findById(foodId);
    meal.status = status;
    await meal.save();
    res.json(meal);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
