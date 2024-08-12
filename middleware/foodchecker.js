const { default: axios } = require('axios');
const foodExtractorGmini = require('../Routes/vertex');
const LogErrorSchema = require('../models/ErrorLog.model');
const foodChecker = async (userInput, userId) => {
  console.log('userInput in foodchecker', userInput);
  const customFood = await foodExtractorGmini(userInput);
  console.log('customFood in foodchecker', customFood);
  const messages = [
    {
      role: 'system',
      content:
        'check if the item is a food item or not. If it is a food item, return the original input. If it is not a food item, return "false". Do not include any explanation.',
    },
    { role: 'user', content: `${userInput}` },
  ];

  const requestBody = {
    messages,
    temperature: 0,
    top_p: 0.7,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 500,
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
    // console.log('food checker', response.data.choices[0].message.content);

    const startIndex = response.data.choices[0].message.content.indexOf('[');
    const endIndex = response.data.choices[0].message.content.lastIndexOf(']');
    const parsedContent = JSON.parse(
      response.data.choices[0].message.content.slice(startIndex, endIndex + 1)
    );

    return parsedContent;
  } catch (error) {
    const errorLog = new LogErrorSchema({
      error: error.message,
      userId: userId,
      errorData: error,
    });

    await errorLog.save();
    //console.error('Error extracting food items:', error.message);
    throw new Error('Error extracting food items');
  }
};

module.exports = foodChecker;
