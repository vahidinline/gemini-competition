const express = require('express');
const multer = require('multer');
//const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { default: axios } = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Set up storage using multer for incoming files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    // Prepare the file to be sent to Azure OpenAI
    const fileStream = fs.createReadStream(req.file.path);
    const formData = new FormData();
    formData.append('file', fileStream);

    // Replace 'YourDeploymentName' with your actual deployment name
    // Also, ensure you have the AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY set in your environment variables
    const azureUrl = `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/YourDeploymentName/audio/transcriptions?api-version=2024-02-01`;

    const response = await axios.post(azureUrl, {
      body: formData,
      headers: {
        'api-key': process.env.AZURE_OPENAI_API_KEY,
        ...formData.getHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`Error from Azure OpenAI: ${response.statusText}`);
    }

    const data = await response.json();

    // Clean up: remove the temporary file
    fs.unlinkSync(req.file.path);

    // Send the transcription back to the client
    res.json(data);
  } catch (error) {
    console.error('Failed to process and send file:', error);
    res.status(500).send('Internal Server Error');
  }
});
