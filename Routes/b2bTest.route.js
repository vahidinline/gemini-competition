const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const aiRequestOpenAi = require('../middleware/aiRequestOpenAi');
const jsonToHtmlTable = require('../middleware/jsonToTable');
const getNutrition = require('../middleware/getNutrition');

router.post('/query', async (req, res) => {
  const userText = req.body.query;
  let aiResponse = await aiRequestOpenAi(userText);
  const convertedToTable = jsonToHtmlTable(aiResponse);
  aiResponse = JSON.parse(aiResponse);
  console.log('aiResponse:', typeof aiResponse);

  console.log('aiResponse:', aiResponse);
  //return;
  try {
    const ingredients = aiResponse.meal.map((item) => item.name);
    const amount = aiResponse.meal.map((item) => item.amount);
    console.log('Ingredient:', ingredients);
    console.log('Amount:', amount);

    const nutritionInfo = await getNutrition(ingredients, amount);
    console.log('Nutrition Info:', nutritionInfo);
    res.send(nutritionInfo);
  } catch (error) {
    console.error('Error handling message:', error);
    res.status(500).send('Error handling message. Please try again later.');
  }
});

module.exports = router;
