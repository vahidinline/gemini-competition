const express = require('express');
const mongoose = require('mongoose');
const Patient = require('../models/patient.model'); // Path to your model file
const getActivityPlanGemini = require('../middleware/PostRecovery/getActivityPlan');
const PatientActivityPlan = require('../models/PatientActivityPlan.model');
const getDietPlanGemini = require('../middleware/PostRecovery/getDietPlan');
const router = express.Router();

// Middleware to parse JSON requests
router.use(express.json());

// POST /patients - Create a new patient
router.post('/', async (req, res) => {
  console.log(req.body);
  try {
    const newPatient = new Patient(req.body);
    await newPatient.save();
    console.log(newPatient);
    res.status(201).json(newPatient);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

// GET /patients - Get all patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /patients/:id - Get a patient by ID
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /patients/:id - Update a patient by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPatient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.status(200).json(updatedPatient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//get activity plan from gemini

router.get('/generateActivityPlan/:id', async (req, res) => {
  const { id } = req.params;
  console.log('getActivityPlan', id);
  try {
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const activityPlan = await getActivityPlanGemini(patient);

    res.status(200).json(activityPlan);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/generateDietPlan/:id', async (req, res) => {
  const { id } = req.params;
  console.log('generateDietPlan', id);
  try {
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const activityPlan = await getDietPlanGemini(patient);

    res.status(200).json(activityPlan);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/getActivityPlan/:id', async (req, res) => {
  const { id } = req.params;
  console.log('getActivityPlan', id);
  try {
    const activityPlan = await PatientActivityPlan.find({
      patientId: id,
    })
      .lean()
      .exec();
    if (!activityPlan) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const lastActivityPlan = activityPlan[activityPlan.length - 1];

    res.status(200).json(lastActivityPlan);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
