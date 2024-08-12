const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const PreFilledFoodItemSchema = require('../models/PreFilledMeal.model');

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ...

// The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const foodCheckerGmini = async (userInput) => {
  // console.log('userInput in gmini food checker', userInput);
  const prompt = `Translate the input to English, then check if the ${userInput} contain food items or not. If it is a food item, return the original input. If it is not a food item, return "false". Do not include any explanation.`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log('text', text);
  if (text === 'false') {
    console.log('search in my database');
    // Food not recognized by Gemini - check your database
    const foodItem = await PreFilledFoodItemSchema.findOne({
      $or: [{ foodItem: userInput }, { persian_name: userInput }],
    });

    if (foodItem) {
      return foodItem; // Food found in the database
    } else {
      return 'false'; // Not found in either Gemini or the database
    }
  } else {
    return text; // Gemini identified it as food
  }
};

module.exports = foodCheckerGmini;
