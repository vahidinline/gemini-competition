const express = require('express');
const router = express.Router();
require('dotenv').config();

router.post('/', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  const { email, name } = req.body;

  res.json('email has been sent');
});

module.exports = router;
