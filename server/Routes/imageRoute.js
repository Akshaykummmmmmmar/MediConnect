const express = require('express');
const multer = require('multer');
const uniqid = require('uniqid');
const checkToken = require('../middleware/checkToken');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/');
  },
  filename: (req, file, cb) => {
    cb(null, uniqid() + '_' + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post('/image-upload', upload.single('image'), (req, res) => {
  res.status(201).json({
    message: 'Image uploaded',
    url: `http://localhost:4000/${req.file.filename}`,
  });
});

module.exports = router;
