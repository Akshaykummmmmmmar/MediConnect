const express = require('express');
const multer = require('multer');
const path = require('path');
const uniqid = require('uniqid');
const checkToken = require('../middleware/checkToken');

const router = express.Router();

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, uniqid() + ext.toLowerCase());
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new Error('Only image files (JPEG, PNG, WEBP, GIF) are allowed'));
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});

router.post('/image-upload', checkToken(['admin', 'doctor']), (req, res) => {
  upload.single('image')(req, res, err => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    res.status(201).json({
      message: 'Image uploaded',
      url: `${req.protocol}://${req.get('host')}/${req.file.filename}`,
    });
  });
});

module.exports = router;
