const foodExtractorGmini = require('../Routes/vertex');
const mealModel = require('../models/meal.model');
const foodCheckerGmini = require('./foodChecker.Gemini');

async function extractFoodItems(userInput) {
  const checkFood = await foodCheckerGmini(userInput);
  console.log('checkFood in extractFoodItems', checkFood);
  if (checkFood === 'false') {
    // console.log('checkFood in extractFoodItems is false');
    return null;
  } else {
    //console.log('checkFood in extractFoodItems is true', userInput);
    const rawResult = await foodExtractorGmini(userInput);
    console.log('rawResult in extractFoodItems', rawResult);
    // const customFood = await foodExtractorGmini(userInput);

    // Extract the JSON content from the raw result
    const start = rawResult.indexOf('{');
    const end = rawResult.lastIndexOf('}');
    const result = rawResult.slice(start, end + 1);

    // Parse the extracted JSON content
    const parsedContent = JSON.parse(result);

    // Check if the parsed content has an error code of 404
    if (parsedContent.error_code === 404 || parsedContent.error === 404) {
      console.log('parsedContent.error_code in extractFoodItems', 404);
      return null;
    } else {
      return parsedContent;
    }
  }
}

module.exports = extractFoodItems;
