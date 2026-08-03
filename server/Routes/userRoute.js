const express = require('express');
const User = require('../database/models/userSchema');
const Doctor = require('../database/models/docterSchema');
const Appointment = require('../database/models/appointmentSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkToken = require('../middleware/checkToken');
const router = express.Router();

router.post('/signUp/register', async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      emergencyContact,
      address,
      email,
      contactNumber,
      password,
      confirmPassword,
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password does'nt match" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { name }] });
    if (existingUser) {
      if (existingUser) {
        return res
          .status(400)
          .json({ message: 'Email or Password already exists' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const dbResponse = await User.create({
      name,
      age,
      gender,
      emergencyContact,
      address,
      email,
      contactNumber,
      password: hashedPassword,
      role: 'patient',
    });

    res.status(200).json({ message: 'New user created' });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email is incorect' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }
    const SECRET_KEY = 'gghfhergyfgreherhuerhue';
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, {
      expiresIn: '7d',
    });

    let doctorData = null;
    let patientData = null;

    if (user.role === 'doctor') {
      doctorData = await Doctor.findOne({ user: user._id }).populate({
        path: 'user',
        select: 'name email',
      });
    } else if (user.role === 'patient') {
      patientData = user;
    }
    return res.status(200).json({
      message: 'User logged in',
      token,
      _id: user._id,
      name: user.name,
      role: user.role,
      email: user.email,
      doctor: doctorData,
      patient: patientData,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.get(
  '/doctors/count',
  checkToken(['admin', 'doctor', 'patient']),
  async (req, res) => {
    try {
      const doctorCount = await Doctor.countDocuments();
      const patientCount = await User.countDocuments({ role: 'patient' });
      const appointmentCount = await Appointment.countDocuments();

      res.status(200).json({
        doctors: doctorCount,
        patients: patientCount,
        appointments: appointmentCount,
      });
    } catch (e) {
      return res.status(500).json({ message: 'Error getting count' });
    }
  }
);

module.exports = router;
