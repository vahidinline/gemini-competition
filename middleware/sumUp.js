const mealModel = require('../models/meal.model');

async function sumUpFunc(ctx) {
  // Fetch all meals for the user for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const meals = await mealModel.find({
    userId: ctx.from.id,
    date: { $gte: today, $lt: tomorrow },
  });
  console.log(meals);
  // Initialize nutrition totals
  let totalCalories = 0;
  let totalFat = 0;
  let totalProtein = 0;
  let totalCarbohydrates = 0;
  let totalFiber = 0;

  // Calculate totals
  meals.forEach((meal) => {
    meal.meal.forEach((nutrition) => {
      totalCalories += nutrition.calories;
      totalFat += nutrition.fat_total_g;
      totalProtein += nutrition.protein_g;
      totalCarbohydrates += nutrition.carbohydrates_total_g;
      totalFiber += nutrition.fiber_g;
    });
  });

  // Send report to the user
  ctx.reply(
    `Daily Report:\nTotal Calories: ${totalCalories}\nTotal Fat: ${totalFat}g\nTotal Protein: ${totalProtein}g\nTotal Carbohydrates: ${totalCarbohydrates}g\nTotal Fiber: ${totalFiber}g`
  );
}

module.exports = sumUpFunc;
