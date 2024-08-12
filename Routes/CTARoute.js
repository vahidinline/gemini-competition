const express = require('express');
const router = express.Router();
const fitnessCalculatorFunctions = require('fitness-calculator');
const CTA = require('../models/cta.model.js');

require('dotenv').config();

const Mailjet = require('node-mailjet');
const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);
router.get('/', async (req, res) => {
  res.json('Hi');
});
router.post('/', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  // Request headers you wish to allow
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type'
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  const {
    name,
    email,
    height,
    weight,
    gender,
    neck,
    waist,
    hip,
    age,
    activity,
  } = req.body;
  if (
    name &&
    email &&
    height &&
    weight &&
    gender &&
    neck &&
    waist &&
    hip &&
    age &&
    activity
  ) {
    const bmi = fitnessCalculatorFunctions.BMI(Number(height), Number(weight));

    const bfp = fitnessCalculatorFunctions.BFP(
      gender,
      Number(height),
      Number(weight),
      Number(neck),
      Number(waist),
      Number(hip)
    );
    const TDEE = fitnessCalculatorFunctions.TDEE(
      gender,
      Number(age),
      Number(height),
      Number(weight),
      activity
    );
    const bmr = fitnessCalculatorFunctions.BMR(
      gender,
      Number(age),
      Number(height),
      Number(weight)
    );
    console.log(req.body);
    //creating new user
    console.log(bmi, bfp, TDEE, bmr);
    const newUser = new CTA({
      name,
      email,
    });
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: 'noreply@fitlinez.com',
            Name: 'Azar from Fitlinez',
          },
          To: [
            {
              Email: email,
              Name: name,
            },
          ],
          TemplateID: 4184551,
          TemplateLanguage: true,
          Subject: 'Your BMI result',
          Variables: {
            name: name,
            bmi: bmi,
            bfp: bfp.toFixed(1),
            TDEE: TDEE.toFixed(0),
            bmr: bmr.toFixed(0),
          },
        },
      ],
    });
    request
      .then((result) => {
        console.log(result.body);
      })
      .catch((err) => {
        console.log(err.statusCode);
      });

    await newUser.save().then((result) => {
      request
        .then((result) => {
          console.log(result.body);
        })
        .catch((err) => {
          console.log(err.statusCode);
        });

      res.json({
        status: 'OK200',
        data: result,
      });
    });
  } else {
    res.json({
      status: 'ERROR',
      data: 'Please fill all the fields',
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await CTA.deleteOne({ _id: req.params.id });
    res.status(204).send('Deleted');
  } catch {
    res.status(404);
    res.send({ error: "Member doesn't exist" });
  }
});

module.exports = router;
