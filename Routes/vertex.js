const express = require('express');
const router = express.Router();
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require('@google/generative-ai');

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ...

// The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const foodExtractorGmini = async (userInput) => {
  console.log('userInput in foodExtractorGmini ', userInput);
  const prompt = `Please translate the ${userInput} to English and provide the nutrition facts in valid JSON format, with the amount and unit for each nutrient specified separately. Include fields for food_item, serving_size, calories, total_fat, saturated_fat, cholesterol, sodium, total_carbohydrates, dietary_fiber, sugars, protein, and vitamins_and_minerals, with separate values for the amount and unit of each nutrient. For nutrients or vitamins and minerals, if specific information is not available, include the field with the amount as 0 and the unit field empty. Use error codes 500 for unclear requests and 404 for data not found.`;

  //  const prompt = `return nutrition fact of ${userInput} most common recipe identified food item in the JSON should include: - name: String (the name of the food item) - amount: Number (the quantity of the food item) - unit: String (the measurement unit for the quantity).If the food item is unclear or there are multiple items detected, the structure should also include: - unclear: Boolean (true if the item requires clarification) .Example JSON output for well-identified items: [ { 'name':'Bananas', 'amount': 3, 'unit': 'pieces' }, { 'name': 'Milk', 'amount': 2, 'unit': 'liters' } ] Example JSON output for items requiring clarification: [ { 'name': '', 'amount': 0, 'unit': '', 'unclear': true } ]' do not include any explanation`;
  const result = await model.generateContent(prompt);

  const response = await result.response;
  console.log('result in foodExtractorGmini', response.text);
  const text = response.text();
  return text;
};

module.exports = foodExtractorGmini;
