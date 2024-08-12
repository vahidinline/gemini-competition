const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const { VertexAI } = require('@google-cloud/vertexai');
const router = express.Router();
const app = express();
const upload = multer({ dest: 'uploads/' });
const storage = new Storage();

const bucketName = 'videofitlinez'; // replace with your bucket name

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({
  project: 'ai-model-418317',
  location: 'us-central1',
});
const model = 'gemini-1.0-pro-vision-001';

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generation_config: {
    max_output_tokens: 2048,
    temperature: 0.4,
    top_p: 1,
    top_k: 32,
  },
  safety_settings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ],
});

router.post('/', async (req, res) => {
  //const videoPath = req.file.path;
  const prompt = req.body.prompt;
  console.log('prompt', prompt);

  // Upload the video to Google Cloud Storage
  // await storage.bucket(bucketName).upload(videoPath, {
  //   gzip: true,
  //   metadata: {
  //     cacheControl: 'public, max-age=31536000',
  //   },
  // });

  // Get the file as a Buffer
  //const file = storage.bucket(bucketName).file(req.file.filename);
  //const [contents] = await file.download();

  // Convert the Buffer to a base64 string
  //const videoBase64 = contents.toString('base64');

  const generateContentReq = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          // { inline_data: { mime_type: 'video/mp4', data: videoBase64 } },
        ],
      },
    ],
  };

  const streamingResp = await generativeModel.generateContentStream(
    generateContentReq
  );

  let aggregatedResponse = '';
  for await (const item of streamingResp.stream) {
    aggregatedResponse += JSON.stringify(item);
  }

  res.send(
    'aggregated response: ' + JSON.stringify(await streamingResp.response)
  );
});

module.exports = router;
