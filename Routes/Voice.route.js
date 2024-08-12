const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const speech = require('@google-cloud/speech');
const multer = require('multer');

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Multer for handling file uploads
const upload = multer({ dest: 'uploads/' }); // Specify the directory where audio files will be stored

// Function to transcribe audio using Google Cloud Speech-to-Text API
const transcribeAudio = async (audioFilePath, languageCode = 'en-US') => {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const keyFilename = process.env.GOOGLE_CLOUD_KEY_FILE;

  const client = new speech.SpeechClient({
    projectId: projectId,
    keyFilename: keyFilename,
  });

  // The audio file's encoding, sample rate in Hertz, and BCP-47 language code
  const config = {
    encoding: 'FLAC', // Adjust based on your audio file encoding
    sampleRateHertz: 44100, // Adjust based on your audio file sample rate
    languageCode: languageCode,
  };

  const audio = {
    uri: audioFilePath,
  };

  const request = {
    config: config,
    audio: audio,
  };

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  const transcription = response.results
    .map((result) => result.alternatives[0].transcript)
    .join('\n');

  return transcription;
};

// Express route to handle audio upload and transcription
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    // Access the uploaded audio file
    const audioFilePath = req.file.path;

    // Transcribe the audio
    const transcription = await transcribeAudio(audioFilePath);

    // Send the transcription back to the frontend
    res.json({ transcription });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: 'Error transcribing audio' });
  }
});

module.exports = router;
