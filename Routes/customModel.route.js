const express = require('express');
const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');

const app = express();
const router = express.Router();

// Replace these with your actual values
const ENDPOINT_ID = '2382076548413915136';
const PROJECT_ID = '350430681081';
const KEY_FILE_PATH = './config/key.json';

// Initialize GoogleAuth client
const auth = new GoogleAuth({
  keyFile: KEY_FILE_PATH,
  scopes: 'https://www.googleapis.com/auth/cloud-platform',
});

// Get the auth token
const getAuthToken = async () => {
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token;
};

// Middleware to parse JSON request bodies
app.use(express.json());

// Define the API endpoint
router.post('/', async (req, res) => {
  const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/endpoints/${ENDPOINT_ID}:predict`;
  const authToken = await getAuthToken();
  const inputData = req.body;
  console.log('Received input data:', inputData);

  try {
    const response = await axios.post(url, inputData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Prediction response:', response.data);
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      // Request made and server responded
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // Request made but no response received
      console.error('Error request data:', error.request);
      res.status(500).json({ error: 'No response received from server' });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;
