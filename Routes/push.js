const express = require('express');
const router = express.Router();
const { Expo } = require('expo-server-sdk');
const mongoose = require('mongoose');
const User = require('../models/user.model.js');

// Initialize the Expo SDK
const expo = new Expo();

// Define the API endpoint
router.post('/', async (req, res) => {
  const { title, message } = req.body;
  try {
    // Fetch all users from the MongoDB database
    const users = await User.find({});

    // Create an array of notification objects
    const notifications = [];
    users.forEach((user) => {
      if (Expo.isExpoPushToken(user.pushToken)) {
        const notification = {
          to: user.pushToken,
          title: title,
          body: message,
        };
        notifications.push(notification);
        console.log(`Push token ${user.pushToken} for user ${user._id}`);
      } else {
        console.error(`Invalid push token for user ${user._id}: ${user.name}`);
      }
    });
    // Send the notifications to all the users
    const chunks = expo.chunkPushNotifications(notifications);
    const tickets = [];
    for (let chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }

    res.send({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error });
  }
});

module.exports = router;
