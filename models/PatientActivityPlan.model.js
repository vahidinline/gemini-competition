const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define a schema for exercises
const exerciseSchema = new Schema({
  name: String,
  description: String,
  exerciseId: String,
  exerciseImage: String,
  notes: String,
});

// Define a schema for activity plan for each day
const dailyActivityPlanSchema = new Schema(
  {
    day: {
      type: Number,
      required: true,
    },
    exercises: [exerciseSchema], // Array of exercises
  },
  { _id: true }
); // Automatically adds an `_id` field to each daily plan

// Define the schema for the entire activity plan
const activityPlanSchema = new Schema({
  activityPlan: [dailyActivityPlanSchema], // Array of daily activity plans
  generalNotes: [String],
});

// Define the schema for patient information
const patientActivityPlanSchema = new Schema({
  patientId: {
    type: String,
    required: [true, 'Patient ID is required'],
    default: '',
  },
  activityPlan: {
    type: activityPlanSchema,
    required: [true, 'Activity Plan is required'],
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
const PatientActivityPlan = mongoose.model(
  'PatientActivityPlan',
  patientActivityPlanSchema
);

module.exports = PatientActivityPlan;
