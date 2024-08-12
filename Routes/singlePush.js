const express = require('express');
const router = express.Router();
const { Expo } = require('expo-server-sdk');
const mongoose = require('mongoose');
const User = require('../models/user.model.js');

// Initialize the Expo SDK
const expo = new Expo();

// Define the API endpoint
router.post('/', async (req, res) => {
  const { id, title, message } = req.body;
  console.log(id, title, message);
  try {
    // Fetch all users from the MongoDB database
    const user = await User.findById(id);
    if (!user) {
      console.error(`User with ID ${id} not found`);
      return;
    }
    // Create an array of notification objects

    const notification = {
      to: user.pushToken,
      title: title,
      body: message,
    };
    expo
      .sendPushNotificationsAsync([notification])
      .then((receipts) => {
        console.log(receipts);
      })
      .catch((error) => {
        console.error(error);
      });

    res.send({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error });
  }
});

module.exports = router;
