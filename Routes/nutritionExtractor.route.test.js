// nutritionExtractor.route.test.js

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { getNutritionFacts } = require('./nutritionExtractor.route'); // Adjust the path to your function

const mock = new MockAdapter(axios);

describe('getNutritionFacts', () => {
  afterEach(() => {
    mock.reset();
  });

  it('should return nutrition facts for a valid food item', async () => {
    const mockResponse = {
      calories: 100,
      carbs: 20,
      protein: 10,
      sugar: 5,
      fat: 3,
    };
    mock.onPost(process.env.OPENAI_FOOD_API_GPT_4_ENDPOINT).reply(200, {
      choices: [{ message: { content: JSON.stringify(mockResponse) } }],
    });

    const foodItem = { amount: '100 grams', food: 'apple' };
    const result = await getNutritionFacts(foodItem);

    expect(result).toEqual(mockResponse);
  });

  it('should throw an error if API returns an error', async () => {
    mock.onPost(process.env.OPENAI_FOOD_API_ENDPOINT).reply(500);

    const foodItem = { amount: '100 grams', food: 'apple' };

    await expect(getNutritionFacts(foodItem)).rejects.toThrow(
      'Error getting nutrition facts'
    );
  });

  it('should throw an error for an invalid food item', async () => {
    const invalidFoodItem = { amount: '100 grams' }; // Missing 'food' or 'foodItem' key

    await expect(getNutritionFacts(invalidFoodItem)).rejects.toThrow(
      'Invalid food item'
    );
  });
});
