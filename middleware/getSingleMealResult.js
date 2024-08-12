const Meal = require('../models/meal.model');

const getsingleMealResult = async (userId, selectedMeal) => {
  //console.log('userId in getSingleMealResult', userId);
  // console.log('selectedMeal in getSingleMealResult', selectedMeal);

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const todayEnd = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  try {
    console.log('getSingleMealResult');
    // Find meals for the user within the specified date range
    const meals = await Meal.find({
      userId,
      mealName: selectedMeal,
      status: { $ne: 'rejected' },
      date: {
        $gte: todayStart,
        $lt: todayEnd,
      },
    });

    if (!meals || meals.length === 0) {
      return null; // No meals found
    }

    //console.log('# of meals in getsingleMealResult', meals.length);

    const totalNutrition = {
      calories: 0,
      total_fat: 0,
      saturated_fat: 0,
      cholesterol: 0,
      sodium: 0,
      total_carbohydrates: 0,
      dietary_fiber: 0,
      sugars: 0,
      protein: 0,
      vitamins_and_minerals: {
        vitamin_a: {
          amount: 0,
          unit: 'mcg',
        },
        vitamin_c: {
          amount: 0,
          unit: 'mg',
        },
        calcium: {
          amount: 0,
          unit: 'mg',
        },
        iron: {
          amount: 0,
          unit: 'mg',
        },
      },
    };

    // Iterate over each meal object
    for (const meal of meals) {
      // Check if the meal has food items and iterate over them
      if (Array.isArray(meal.foodItems)) {
        for (const foodItem of meal.foodItems) {
          // Use optional chaining and nullish coalescing to safely access nested properties
          totalNutrition.calories += parseFloat(foodItem.calories?.amount ?? 0);
          totalNutrition.total_fat += parseFloat(
            foodItem.total_fat?.amount ?? 0
          );
          totalNutrition.saturated_fat += parseFloat(
            foodItem.saturated_fat?.amount ?? 0
          );
          totalNutrition.cholesterol += parseFloat(
            foodItem.cholesterol?.amount ?? 0
          );
          totalNutrition.sodium += parseFloat(foodItem.sodium?.amount ?? 0);
          totalNutrition.total_carbohydrates += parseFloat(
            foodItem.total_carbohydrates?.amount ?? 0
          );
          totalNutrition.dietary_fiber += parseFloat(
            foodItem.dietary_fiber?.amount ?? 0
          );
          totalNutrition.sugars += parseFloat(foodItem.sugars?.amount ?? 0);
          totalNutrition.protein += parseFloat(foodItem.protein?.amount ?? 0);

          totalNutrition.vitamins_and_minerals.vitamin_a.amount += parseFloat(
            foodItem.vitamins_and_minerals?.vitamin_a?.amount ?? 0
          );
          totalNutrition.vitamins_and_minerals.vitamin_c.amount += parseFloat(
            foodItem.vitamins_and_minerals?.vitamin_c?.amount ?? 0
          );
          totalNutrition.vitamins_and_minerals.calcium.amount += parseFloat(
            foodItem.vitamins_and_minerals?.calcium?.amount ?? 0
          );
          totalNutrition.vitamins_and_minerals.iron.amount += parseFloat(
            foodItem.vitamins_and_minerals?.iron?.amount ?? 0
          );
        }
      }
    }

    return totalNutrition; // Return the aggregated nutrition data
  } catch (error) {
    console.error(error.message);
    return null; // Return null if an error occurs
  }
};

module.exports = getsingleMealResult;
