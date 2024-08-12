const Meal = require('../models/meal.model');

const storeFoodItem = async (results, userId, selectedMeal, inputType) => {
  //console.log('results in storeFoodItem', results);

  //   console.log('userId in storeFoodItem', userId);
  //   console.log('selectedMeal in', selectedMeal);

  try {
    // Ensure results is always an array
    const foodItems = Array.isArray(results) ? results : [results];
    // console.log('foodItems in storeFoodItem', foodItems[0].food_items);

    // این قسمت از کد برای یک ابجکت کار میکنه. ولی برای ارایه دخیره نمیکنه

    for (const item of foodItems) {
      if (item) {
        // console.log('item in storeFoodItem is object', item);
        // If results is an array, handle each item separately
        // if (item.unclear === true) {
        //   item.unclear = false;
        // }
        const meal = new Meal({
          userId: userId,
          mealName: selectedMeal,
          inputType: inputType,
          foodItems: item,
        });
        await meal.save();
        console.log('meal in storeFoodItem', meal);
        return meal;
      } else {
        console.warn('Invalid food item in storefoodItem:', item);
        return null;
      }
    }

    //return results; // Return the original input (array or object)
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

module.exports = storeFoodItem;
