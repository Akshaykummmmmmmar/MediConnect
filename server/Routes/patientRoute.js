const express = require('express');
const User = require('../database/models/userSchema');
const router = express.Router();
const checkToken = require('../middleware/checkToken');

router.get('/get/patients', async (req, res) => {
  try {
    const getPatients = await User.find({ role: 'patient' }, '-password');
    return res.status(200).json(getPatients);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

module.exports = router;
