const e = require('express');
const mongoose = require('mongoose');

const exerciseList = new mongoose.Schema({
  name: {
    type: String,

    required: [true, 'Please provide a name'],
  },
  sets: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    default: 3,
  },

  reps: {
    type: Number,
  },
  weight: {
    type: Number,
  },

  mainTarget: {
    type: String,
    enum: [
      'Chest',
      'Upper Back',
      'Lower Back',
      'Shoulders',
      'Biceps',
      'Triceps',
      'Forearms',
      'Abdominals',
      'Obliques',
      'Quadriceps',
      'Hamstrings',
      'Glutes',
      'Calves',
      'Hip Adductors',
      'Hip Abductors',
    ],
  },
  otherTarget: {
    type: String,
    enum: [
      'Chest',
      'Upper Back',
      'Lower Back',
      'Shoulders',
      'Biceps',
      'Triceps',
      'Forearms',
      'Abdominals',
      'Obliques',
      'Quadriceps',
      'Hamstrings',
      'Glutes',
      'Calves',
      'Hip Adductors',
      'Hip Abductors',
    ],
  },

  categoryMuscle: {
    type: String,
    enum: [
      'upper body',
      'lower body',
      'full body',
      'core',
      'cardio',
      'stretching',
    ],
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  inputType: {
    type: String,
    enum: ['rep', 'weight', 'timer'],
    default: 'rep',
  },
  location: {
    type: String,
    enum: ['Gym', 'Home'],
    default: 'Gym',
  },
  type: {
    type: String,
    enum: [
      'normal',
      'strength',
      'cardio',
      'stretching',
      'warmup',
      'cooldown',
      'timer',
    ],
    default: 'normal',
  },

  muscleType: {
    type: String,
    enum: ['Compound', 'Isolation'],
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Deleted', 'Draft'],
    default: 'Active',
  },
  gifUrl: String,
  image: String,
  video: String,
  equipment: {
    type: String,
    enum: [
      'None',
      'Dumbbells',
      'Barbells',
      'Weight Plates',
      'Kettlebells',
      'Resistance Bands',
      'Pull-Up Bar',
      'Bench',
      'Squat Rack',
      'Cable Machine',
      'Treadmill',
      'Elliptical Machine',
      'Stationary Bike',
      'Rowing Machine',
      'Jump Rope',
      'Medicine Ball',
      'Yoga Mat',
      'Foam Roller',
      'TRX Suspension Trainer',
      'Battle Ropes',
      'Gymnastic Rings',
      'Sandbags',
      'Punching Bag',
      'Stability Ball',
      'Step Platform',
      'Box for Box Jumps',
      'Parallettes',
      'Ab Wheel',
      'Weightlifting Belt',
      'Weighted Vest',
      'Agility Ladder',
      'Cones',
    ],
  },
});

const Exercise = mongoose.model('exerciseList', exerciseList);

module.exports = Exercise;
