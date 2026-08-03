const express = require('express');
const bcrypt = require('bcrypt');
const Doctor = require('../database/models/docterSchema');
const User = require('../database/models/userSchema');
const Medicine = require('../database/models/medicinesSchema');
const checkToken = require('../middleware/checkToken');

const router = express.Router();

router.post('/addAdmin', checkToken(['admin']), async (req, res) => {
  try {
    const { name, email, password, confirmPassword, contactNumber } = req.body;

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords don't match" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Admin already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      contactNumber,
      role: 'admin',
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        password: admin.password,
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/adddoctor', checkToken(['admin']), async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      age,
      image,
      specialization,
      experience,
      licenseNumber,
      department,
      consultationFee,
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password does'nt match!" });
    }
    const emailMatch = await User.findOne({ email });
    if (emailMatch) {
      return res.status(400).json({ message: 'user already exists!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'doctor',
    });

    const doctor = await Doctor.create({
      user: user._id,
      age,
      image,
      specialization,
      experience,
      licenseNumber,
      department,
      consultationFee,
    });
    return res.status(201).json({
      message: 'Doctor added successfully',
      doctor: {
        _id: doctor._id,
        name: user.name,
        email: user.email,
        age: doctor.age,
        image: doctor.image,
        specialization: doctor.specialization,
        experience: doctor.experience,
        licenseNumber: doctor.licenseNumber,
        department: doctor.department,
        consultationFee: doctor.consultationFee,
      },
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.post('/add/medicine', checkToken(['admin']), async (req, res) => {
  try {
    const addMedicine = await Medicine.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Medicine added successfully',
      data: addMedicine,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.get('/get/medicines/', async (req, res) => {
  try {
    const getMedicines = await Medicine.find();
    return res.status(200).json(getMedicines);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.get(
  '/doctors/get',
  checkToken(['admin', 'patient']),
  async (req, res) => {
    try {
      const getDoctors = await Doctor.find()
        .populate('user', 'name email role')
        .populate('department', 'name description');

      return res.status(200).json(getDoctors);
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
);

router.delete('/doctor/delete/:id', checkToken(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const deleteBYId = await Doctor.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.get('/doctor/byUser/:userId', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.params.userId });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

module.exports = router;
