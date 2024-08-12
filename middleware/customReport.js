// const mealModel = require('../models/meal.model');
// const Meal = require('../models/meal.model');

// async function calculateTotalNutritionBetweenDates(userId, startDate, endDate,daysBetween) {
//   try {
//     // Ensure dates are at the start and end of their respective days
//     const startOfPeriod = new Date(startDate);
//     startOfPeriod.setHours(0, 0, 0, 0);

//     const endOfPeriod = new Date(endDate);
//     endOfPeriod.setHours(23, 59, 59, 999);

//     const aggregateResult = await Meal.aggregate([
//       {
//         $match: {
//           userId: userId,
//           date: { $gte: startOfPeriod, $lte: endOfPeriod },
//         },
//       },
//       { $unwind: '$foodItems' },
//       {
//         $group: {
//           _id: null,
//           totalCalories: { $sum: { $toDouble: '$foodItems.calories.amount' } },
//           totalFat: { $sum: { $toDouble: '$foodItems.total_fat.amount' } },
//           totalProtein: { $sum: { $toDouble: '$foodItems.protein.amount' } },
//           totalFiber: {
//             $sum: { $toDouble: '$foodItems.dietary_fiber.amount' },
//           },
//           totalSodium: { $sum: { $toDouble: '$foodItems.sodium.amount' } },
//           totalCarbs: {
//             $sum: { $toDouble: '$foodItems.total_carbohydrates.amount' },
//           },
//           // Add other nutritional components as needed
//         },
//       },
//     ]);

//     console.log(aggregateResult);
//     return aggregateResult;
//   } catch (err) {
//     console.error(err);
//     return null;
//   }
// }

// module.exports = calculateTotalNutritionBetweenDates;

const mealModel = require('../models/meal.model');
const Meal = require('../models/meal.model');

async function calculateTotalNutritionBetweenDates(
  userId,
  startDate,
  endDate,
  daysBetween
) {
  try {
    console.log('userId', userId, startDate, endDate, daysBetween);
    // Ensure dates are at the start and end of their respective days
    const startOfPeriod = new Date(startDate);
    startOfPeriod.setHours(0, 0, 0, 0);

    const endOfPeriod = new Date(endDate);
    endOfPeriod.setHours(23, 59, 59, 999);

    const aggregateResult = await Meal.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startOfPeriod, $lte: endOfPeriod },
        },
      },
      { $unwind: '$foodItems' },
      {
        $group: {
          _id: null,
          totalCalories: { $sum: { $toDouble: '$foodItems.calories.amount' } },
          totalFat: { $sum: { $toDouble: '$foodItems.total_fat.amount' } },
          totalProtein: { $sum: { $toDouble: '$foodItems.protein.amount' } },
          totalFiber: {
            $sum: { $toDouble: '$foodItems.dietary_fiber.amount' },
          },
          totalSodium: { $sum: { $toDouble: '$foodItems.sodium.amount' } },
          totalCarbs: {
            $sum: { $toDouble: '$foodItems.total_carbohydrates.amount' },
          },
          // Add other nutritional components as needed
        },
      },
    ]);

    if (aggregateResult.length === 0) {
      return {
        averageCalories: 0,
        averageFat: 0,
        averageProtein: 0,
        averageFiber: 0,
        averageSodium: 0,
        averageCarbs: 0,
      };
    }

    const totals = aggregateResult[0];

    // Calculate averages
    const averages = {
      averageCalories: Number((totals.totalCalories / daysBetween).toFixed(0)),
      averageFat: Number((totals.totalFat / daysBetween).toFixed(0)),
      averageProtein: Number((totals.totalProtein / daysBetween).toFixed(0)),
      averageFiber: Number((totals.totalFiber / daysBetween).toFixed(0)),
      averageSodium: Number((totals.totalSodium / daysBetween).toFixed(0)),
      averageCarbs: Number((totals.totalCarbs / daysBetween).toFixed(0)),
      // Add other nutritional components as needed
    };

    console.log(averages);
    return averages;
  } catch (err) {
    console.error(err);
    return null;
  }
}

module.exports = calculateTotalNutritionBetweenDates;
