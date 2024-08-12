const Meal = require('../models/meal.model');
const LogErrorSchema = require('../models/ErrorLog.model');

async function calculateTotalNutritionForDay(userId, date = new Date()) {
  console.log('userId in calculateTotalNutritionForDay', userId);
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const aggregateResult = await Meal.aggregate([
      {
        $match: { userId: userId, date: { $gte: startOfDay, $lte: endOfDay } },
      },
      { $unwind: '$foodItems' },
      {
        $group: {
          _id: null,
          totalCalories: {
            $sum: {
              $cond: {
                if: {
                  $regexMatch: {
                    input: '$foodItems.calories.amount',
                    regex: /^[0-9.]+$/,
                  },
                },
                then: { $toDouble: '$foodItems.calories.amount' },
                else: 0,
              },
            },
          },
          totalFat: {
            $sum: {
              $cond: {
                if: {
                  $regexMatch: {
                    input: '$foodItems.total_fat.amount',
                    regex: /^[0-9.]+$/,
                  },
                },
                then: { $toDouble: '$foodItems.total_fat.amount' },
                else: 0,
              },
            },
          },
          totalProtein: {
            $sum: {
              $cond: {
                if: {
                  $regexMatch: {
                    input: '$foodItems.protein.amount',
                    regex: /^[0-9.]+$/,
                  },
                },
                then: { $toDouble: '$foodItems.protein.amount' },
                else: 0,
              },
            },
          },
          totalFiber: {
            $sum: {
              $cond: {
                if: {
                  $regexMatch: {
                    input: '$foodItems.dietary_fiber.amount',
                    regex: /^[0-9.]+$/,
                  },
                },
                then: { $toDouble: '$foodItems.dietary_fiber.amount' },
                else: 0,
              },
            },
          },
          totalSodium: {
            $sum: {
              $cond: {
                if: {
                  $regexMatch: {
                    input: '$foodItems.sodium.amount',
                    regex: /^[0-9.]+$/,
                  },
                },
                then: { $toDouble: '$foodItems.sodium.amount' },
                else: 0,
              },
            },
          },
          totalCarbs: {
            $sum: {
              $cond: {
                if: {
                  $regexMatch: {
                    input: '$foodItems.total_carbohydrates.amount',
                    regex: /^[0-9.]+$/,
                  },
                },
                then: { $toDouble: '$foodItems.total_carbohydrates.amount' },
                else: 0,
              },
            },
          },
          // Add other nutritional components as needed
        },
      },
    ]);

    console.log(aggregateResult);
    return aggregateResult;
  } catch (err) {
    console.error(err.message);

    try {
      const errorLog = new LogErrorSchema({
        error: err.message,
        userId: userId,
        errorData: err,
      });
      await errorLog.save();
    } catch (logError) {
      console.error('Failed to log error', logError);
    }

    return null;
  }
}

module.exports = calculateTotalNutritionForDay;
