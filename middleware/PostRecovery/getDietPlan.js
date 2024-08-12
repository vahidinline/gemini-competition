const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const isJsonValid = require('is-valid-json');
const PatientActivityPlan = require('../../models/PatientActivityPlan.model');
const Exercise = require('../../models/workouts.model');
const PatientDietPlan = require('../../models/PatientDietPlan.model');

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const getDietPlanGemini = async (userInput) => {
  const {
    _id,
    firstName,
    lastName,
    dateOfBirth,
    sex,
    weight,
    height,
    pastSurgeries,
    reasonOfHospitalization,
    medicalNotes,
    activityLevel,
  } = userInput;
  console.log('userInput', _id.toHexString());

  // Calculate age (rough estimate)
  const birthYear = new Date(dateOfBirth).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  // Construct the prompt
  const prompt = `
  **Patient Information:**
  * **Name:** ${firstName} ${lastName}
  * **Age:** ${age}
  * **Sex:** ${sex}
  * **Weight:** ${weight} kg
  * **Height:** ${height} cm
  * **Activity Level:** ${activityLevel}
  * **Past Surgeries:** ${pastSurgeries}
  * **Reason for Hospitalization:** ${reasonOfHospitalization}
  * **Medical Notes:** ${medicalNotes}


  **Generate Diet Plan:**
  You are a nutrition Specialist and should Create a personalized diet plan for this patient. Consider their age, sex, weight, height, past surgeries, reason for hospitalization, activity level, and any limitations mentioned in the medical notes.

  **Output Format:**
  Please structure the output as a JSON object with the following format.

  {
    "dietPlan": [
      {
        "day": 1,
        "meals": [
          {
            "mealType": "meal Type", // Use the name from the list [Breakfast, Lunch, Dinner, Snack]

            "mealName": "meal Name", // Use the name from the available list

            "description": "meal Description", // Use the description from the available list

            "amount": "meal Amount", // Use the amount from the available list
          },
          // ... more exercises
        ]
      },
      // ... [Day 2, Day 3, etc.]
    ],
    "generalNotes": [
      "General Note 1",
      "General Note 2",
      // ... more general notes
    ]
  }
  `;

  try {
    const rawResult = await model.generateContent(prompt);
    const response = await rawResult.response;

    const filteredResponse = response.candidates[0].content.parts[0].text;

    // Extract the JSON content from the raw result
    const start = filteredResponse.indexOf('{');
    const end = filteredResponse.lastIndexOf('}');
    const result = filteredResponse.slice(start, end + 1);

    // Parse the extracted JSON content
    const parsedContent = JSON.parse(result);

    // store the response in db

    const res = new PatientDietPlan({
      patientId: _id.toHexString(),
      dietPlan: parsedContent,
    });

    await res.save();
    // console.log('Response saved in db:', res);
    // update res activityPlan by finding exercise name and adding exerciseImage
    // for (const day of res.activityPlan.activityPlan) {
    //   for (const exercise of day.exercises) {
    //     const exerciseData = await Exercise.findOne({ _id: exercise._id });
    //     if (exerciseData) {
    //       exercise.name = exerciseData.name;
    //       exercise.exerciseImage = exerciseData.gifUrl;
    //     }
    //   }
    // }
    // await res.save();
    return res;
  } catch (error) {
    console.error('Error generating diet plan:', error.message);
    return 'Error generating diet plan.';
  }
};

module.exports = getDietPlanGemini;
