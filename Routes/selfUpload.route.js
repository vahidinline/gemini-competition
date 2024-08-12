const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload-images', upload.array('images'), (req, res) => {
  console.log(req.files);
  const imageFiles = req.files;
  const imageUrls = [];

  // Process each uploaded image
  imageFiles.forEach((file) => {
    const tempPath = file.path;
    const fileName = file.originalname;
    const targetPath = path.join(__dirname, 'public/uploads', fileName);
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;

    // Move the file to the target directory
    fs.renameSync(tempPath, targetPath);

    // Add the image URL to the array
    imageUrls.push(imageUrl);
  });

  res.json(imageUrls);
});

module.exports = router;
