const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define a schema for exercises
const mealSchema = new Schema({
  mealName: String,
  mealType: String,
  description: String,
  amount: String,
});

// Define a schema for activity plan for each day
const dailyMealPlanSchema = new Schema(
  {
    day: {
      type: Number,
      required: true,
    },
    meals: [mealSchema], // Array of exercises
  },
  { _id: true }
); // Automatically adds an `_id` field to each daily plan

// Define the schema for the entire diet plan
const dietPlanSchema = new Schema({
  dietPlan: [dailyMealPlanSchema], // Array of daily diet plans
  generalNotes: [String],
});

// Define the schema for patient information
const patientDietPlanSchema = new Schema({
  patientId: {
    type: String,
    required: [true, 'Patient ID is required'],
    default: '',
  },
  dietPlan: {
    type: dietPlanSchema,
    required: [true, 'diet Plan is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  doctorApproval: {
    type: String,
    default: 'pending',
  },
});

// Create a model from the schema
const PatientDietPlan = mongoose.model(
  'PatientDietPlan',
  patientDietPlanSchema
);

module.exports = PatientDietPlan;
