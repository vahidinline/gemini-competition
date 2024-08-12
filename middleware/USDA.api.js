const getnutritionData = async (foodItem, amount, unit) => {
  try {
    const response = await axios.get(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${foodItem}&dataType=Branded,Foundation,Survey%20%28FNDDS%29&pageSize=20&requireAllWords=true&api_key=${APIKEY}`
    );

    const foodData = response.data.foods[0]; // Assuming the first result is the most relevant
    const defaultServingSize = foodData.servingSize;
    const defaultServingUnit = foodData.servingSizeUnit;
    const nutrition = foodData.foodNutrients;

    // Conversion logic based on the unit
    const conversionFactor = calculateConversionFactor(
      unit,
      defaultServingUnit,
      amount,
      defaultServingSize
    );

    const adjustedNutrition = nutrition.map((nutrient) => ({
      name: nutrient.nutrientName,
      amount: nutrient.value * conversionFactor,
      unit: nutrient.unitName,
    }));

    return { foodItem, amount, unit, nutrition: adjustedNutrition };
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

function calculateConversionFactor(
  inputUnit,
  defaultUnit,
  inputAmount,
  defaultAmount
) {
  // Implement your unit conversion logic here
  // For simplicity, assuming units are compatible and using a direct ratio
  return inputAmount / defaultAmount;
}

module.exports = getnutritionData;
