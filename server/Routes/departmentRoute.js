const express = require('express');
const Department = require('../database/models/department');
const doctor = require('../database/models/docterSchema');
const checkToken = require('../middleware/checkToken');

const router = express.Router();

router.post('/add/department', async (req, res) => {
  try {
    const { name, description } = req.body;

    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    const department = await Department.create({ name, description });

    res.status(201).json({
      message: 'Department added successfully',
      department,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.get(
  '/department/get',
  checkToken(['admin', 'doctor']),
  async (req, res) => {
    try {
      const departments = await Department.find().sort({ createdAt: -1 });

      res.status(200).json(departments);
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
);

module.exports = router;
