const axios = require('axios');

async function getNutrition(ingredients, amounts) {
  console.log('Getting nutrition info for:', ingredients, amounts);

  const results = [];

  for (let i = 0; i < ingredients.length; i++) {
    const ingredient = ingredients[i];
    const amount = amounts[i];

    // Parse the amount to a number
    const amountInGrams = parseFloat(amount);

    try {
      const response = await axios.get(
        'https://api.api-ninjas.com/v1/nutrition',
        {
          params: {
            query: ingredient,
          },
          headers: {
            'X-Api-Key': process.env.NINJA_NUTRITION_API,
          },
        }
      );

      // If the response is successful, calculate the nutrition based on the amount
      if (response.data && response.data.length > 0) {
        console.log('Nutrition info:', response.data[0]);
        const nutritionInfo = response.data[0];
        const servingSize = parseFloat(nutritionInfo.serving_size_g);

        // Calculate the ratio of the amount to the serving size
        const ratio = amountInGrams / servingSize;

        // Update the nutrition info based on the ratio
        for (const key in nutritionInfo) {
          if (key !== 'name' && key !== 'serving_size_g') {
            const value = parseFloat(nutritionInfo[key]);
            if (!isNaN(value)) {
              nutritionInfo[key] = value * ratio;
            }
          }
        }

        // Update the serving_size_g to the actual amount
        nutritionInfo.serving_size_g = amountInGrams;

        console.log('Adjusted Nutrition info:', nutritionInfo);
        results.push(nutritionInfo);
      } else {
        console.log('No nutrition info found for:', ingredient);
      }
    } catch (error) {
      console.error('Error getting nutrition info:', error);
    }
  }

  return results;
}

module.exports = getNutrition;
