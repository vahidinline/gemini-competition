const express = require('express');
const router = express.Router();
const { VertexAI } = require('@google-cloud/vertexai');
const Key = require('../config/key.json');
const axios = require('axios');
const APIKEY = process.env.FOOD_DATA_API;

// Initialize VertexAI with your project and location
const vertex_ai = new VertexAI({
  project: 'fitlinez-backend',
  location: 'us-central1',
  keyFilename: '../config/key.json',
});

// Model name and generation configuration
const model = 'gemini-1.5-pro-preview-0409'; // Update with desired model
const generationConfig = {
  maxOutputTokens: 8192,
  temperature: 1,
  topP: 0.95,
};

// Safety settings
const safetySettings = [
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
];

// Instantiate the generative model
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model,
  generationConfig,
  safetySettings,
});

async function analyzeFood(text) {
  const req = {
    contents: [{ role: 'user', parts: [{ text }] }],
  };
  const response = await generativeModel.generateContent(req);
  const content = response[0].response.candidates[0].content;

  try {
    // Attempt to parse the response as JSON
    const jsonData = JSON.parse(content.parts[0].text);
    return jsonData;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return { error: 'Invalid JSON response from model' };
  }
}

router.post('/getNutritionFacts', async (req, res) => {
  console.log('Request body:', req.body);
  try {
    const foodItemQuery = req.body.name; // Assuming 'name' is the query string
    console.log('Food item query:', foodItemQuery);

    const response = await axios.get(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${foodItemQuery}&dataType=Branded,Foundation,Survey%20%28FNDDS%29&pageSize=20&requireAllWords=true&api_key=${APIKEY}`
    );

    if (
      response.data &&
      response.data.foods &&
      response.data.foods.length > 0
    ) {
      console;
      const foodList = response.data.foods.map((foodItem) => ({
        name: foodItem.description,
        datatype: foodItem.dataType,
        brandOwner: foodItem.brandOwner,
        ingredients: foodItem.ingredients,
        // Process foodNutrients as needed (e.g., extract specific nutrients)
        foodNutrients: foodItem.foodNutrients,
        // 'foodServingSizes' should likely be 'servingSize' and 'servingSizeUnit'
        servingSize: foodItem.servingSize,
        servingSizeUnit: foodItem.servingSizeUnit,
      }));

      console.log('Food list:', foodList);
      res.json(foodList);
    } else {
      console.error('No foods data found for query:', foodItemQuery);
      res.status(404).send('No foods data found');
    }
  } catch (error) {
    console.error(error);
    //send the actual error message to the client
    res.status(500).send(error.message);
  }
});
router.post('/', async (req, res) => {
  const text = req.body.text; // Assuming text is sent in the request body

  if (!text) {
    return res.status(400).send('Missing text input');
  }

  try {
    const result = await analyzeFood(text);
    res.json(result);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send(error.message);
  }
});

module.exports = router;
