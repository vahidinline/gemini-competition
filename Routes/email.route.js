// create route to send email
const express = require('express');
const router = express.Router();
const Email = require('../models/email.model');

// middleware to check if the request header contains the correct key
const checkKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === 'process.env.API_KEY') {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

router.post('/send', checkKey, async (req, res) => {
  const { subject, message, sender, email } = req.body;
  const newEmail = new Email({
    subject,
    message,
    sender,
    recipient: email,
  });

  console.log(newEmail);

  try {
    const result = await request;
    console.log(result.body);

    if (result.body.Messages[0].Status === 'success') {
      const email = await newEmail.save();
      res.status(200).json(email);
    } else {
      res.status(500).json({ message: 'Failed to send email' });
    }
  } catch (error) {
    if (error.code === 11000) {
      res
        .status(400)
        .json({ message: 'Duplicate key error: email already exists' });
    } else {
      res.status(500).json;
    }
  }
});

module.exports = router;
