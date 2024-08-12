const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for patient information
const patientSchema = new Schema(
  {
    patientID: {
      type: String,
      required: [true, 'Patient ID is required'],
      default: '',
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    weight: { type: Number, required: [true, 'Weight is required'] },
    height: { type: Number, required: [true, 'Height is required'] },
    email: {
      type: String,
      required: [true, 'Email is required'],
      validate: {
        validator: function (v) {
          return /^\S+@\S+\.\S+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    sex: {
      type: String,
      required: [true, 'Sex is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
    },
    emergencyContact: {
      type: String,
      required: [true, 'Emergency Contact is required'],
    },
    emergencyPhone: {
      type: String,
      required: [true, 'Emergency Phone is required'],
    },
    insuranceInformation: {
      type: String,
      required: [true, 'Insurance Information is required'],
    },
    previousDiagnoses: {
      type: String,
      required: [true, 'Previous Diagnoses are required'],
    },
    pastSurgeries: {
      type: String,
      required: [true, 'Past Surgeries are required'],
    },
    currentMedications: {
      type: String,
      required: [true, 'Current Medications are required'],
    },
    allergies: {
      type: String,
      required: [true, 'Allergies are required'],
    },
    medicalNotes: {
      type: String,
      required: [true, 'Medical Notes are required'],
    },
    reasonOfHospitalization: {
      type: String,
      required: [true, 'Reason of Hospitalization is required'],
    },
    dateOfAdmission: {
      type: Date,
      required: [true, 'Date of Admission is required'],
    },
    dateOfDischarge: {
      type: Date,
      required: [true, 'Date of Discharge is required'],
    },
    lengthOfStay: {
      type: Number,
      required: [true, 'Length of Stay is required'],
    },

    prcedurePerformed: {
      type: String,
      required: [true, 'Procedure Performed is required'],
    },
    hospitalDischargeSummary: {
      type: String,
      required: [true, 'Hospital Discharge Summary is required'],
    },
    followUpInstructions: {
      type: String,
      required: [true, 'Follow Up Instructions are required'],
    },
    diet: {
      type: String,
      required: [true, 'Diet is required'],
    },
    activityLevel: {
      type: String,
      required: [true, 'Activity Level is required'],
    },
    exerciseRoutine: {
      type: String,
      required: [true, 'Exercise Routine is required'],
    },
    smokingHabits: {
      type: String,
      required: [true, 'Smoking Habits are required'],
    },
    alcoholConsumption: {
      type: String,
      required: [true, 'Alcohol Consumption is required'],
    },
    otherLifestyleFactors: {
      type: String,
      required: [true, 'Other Lifestyle Factors are required'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create a model from the schema
const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
