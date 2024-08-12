const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const isJsonValid = require('is-valid-json');
const PatientActivityPlan = require('../../models/PatientActivityPlan.model');
const Exercise = require('../../models/workouts.model');

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
const model = genAI.getGenerativeModel({
  model: 'tunedModels/activity-generator-q1p0ft3yc3ia',
});

const getActivityPlanGemini = async (userInput) => {
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

  // Filter exercises based on patient situation
  const filteredExercises = await Exercise.find({
    // Filter for exercises suitable for post-surgery recovery
    level: { $in: ['Beginner'] }, // Filter by difficulty level
    loc: 'Home', // Only home exercises
    equipment: 'None', // No equipment required
    type: { $in: ['normal', 'warmup', 'cooldown', 'stretching'] }, //  Filter for specific exercise types
  }).select('name _id'); // Only select name and _id for the prompt

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

  **Available Exercises:**
  ${filteredExercises
    .map((exercise) => `- ${exercise.name} (ID: ${exercise._id.toHexString()})`)
    .join('\n')}

  **Generate Activity Plan:**
  You are a Rehabilitation Specialist and should Create a personalized activity plan for this patient, focusing on light exercises that can be performed at home with no equipment. Consider their age, sex, weight, height, past surgeries, reason for hospitalization, activity level, and any limitations mentioned in the medical notes. Choose exercises from the available list above, referencing them by name or ID. Begin with a single exercise per day, and gradually increase the number of exercises as tolerated.

  **Output Format:**
  Please structure the output as a JSON object with the following format.

  {
    "activityPlan": [
      {
        "day": 1,
        "exercises": [
          {
            "name": "Exercise Name", // Use the name from the available list
            "_id": "Exercise ID" // Use the corresponding _id from the available list
          },
          // ... more exercises
        ]
      },
      // ... [Day 2, Day 3, etc.]
    ],
    "generalNotes": [
      "Important considerations for the patient, e.g., stretching, hydration, pain management"
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

    //store the response in db

    const res = new PatientActivityPlan({
      patientId: _id.toHexString(),
      activityPlan: parsedContent,
    });

    await res.save();
    console.log('Response saved in db:', res);
    // update res activityPlan by finding exercise name and adding exerciseImage
    for (const day of res.activityPlan.activityPlan) {
      for (const exercise of day.exercises) {
        const exerciseData = await Exercise.findOne({ _id: exercise._id });
        if (exerciseData) {
          exercise.name = exerciseData.name;
          exercise.exerciseImage = exerciseData.gifUrl;
        }
      }
    }
    await res.save();
    return res;
  } catch (error) {
    console.error('Error generating activity plan:', error.message);
    return 'Error generating activity plan.';
  }
};

module.exports = getActivityPlanGemini;
