const express = require('express');
const crypto = require('crypto');
require('dotenv').config();
const User = require('../database/models/userSchema');
const Doctor = require('../database/models/docterSchema');
const Patient = require('../database/models/patientSchema');
const Appointment = require('../database/models/appointmentSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkToken = require('../middleware/checkToken');
const {
  generateOtp,
  validateRegister,
  isEmail,
  isStrongPassword,
} = require('../validation');
const { logActivity } = require('../helpers');
const { sendEmail, mailEnabled } = require('../emailer');

const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || 'gghfhergyfgreherhuerhue';

/**
 * @swagger
 * /signUp/register:
 *   post:
 *     summary: Register a new patient (creates User + Patient, sends OTP)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, confirmPassword]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               confirmPassword: { type: string }
 *     responses:
 *       200: { description: Registered successfully }
 */
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
      bloodGroup,
    } = req.body;

    const errors = validateRegister(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { name }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or Name already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

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
      otp,
      otpExpires,
      isVerified: false,
    });

    await Patient.create({
      user: dbResponse._id,
      age: age || undefined,
      bloodGroup: bloodGroup || undefined,
    });

    logActivity({
      user: dbResponse._id,
      role: 'patient',
      action: 'REGISTERED',
      details: `${name} created a new account`,
    });

    await sendEmail({
      to: email,
      subject: 'MediConnect - Verify your email',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });

    const response = {
      message: 'User registered. Please verify your email with the OTP.',
      email,
    };
    if (!mailEnabled) {
      response.otp = otp;
      response.note = 'OTP is returned here for demo purposes. In production it would be emailed.';
    }
    res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /verify-otp:
 *   post:
 *     summary: Verify email with OTP
 *     tags: [Auth]
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (user.isVerified) {
      return res.status(200).json({ message: 'Account already verified' });
    }

    if (!user.otp || user.otp !== String(otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires && user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    logActivity({
      user: user._id,
      role: 'patient',
      action: 'EMAIL_VERIFIED',
      details: `${user.name} verified their email`,
    });

    res.status(200).json({ message: 'Email verified successfully. You can now login.' });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /resend-otp:
 *   post:
 *     summary: Resend verification OTP
 *     tags: [Auth]
 */
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.isVerified)
      return res.status(400).json({ message: 'Account already verified' });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: email,
      subject: 'MediConnect - Your new OTP',
      text: `Your new OTP is ${otp}. It expires in 10 minutes.`,
    });

    const response = { message: 'New OTP sent', email };
    if (!mailEnabled) {
      response.otp = otp;
    }
    res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login and receive a JWT
 *     tags: [Auth]
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email is incorrect' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email first',
        needsOtp: true,
        email,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
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

    logActivity({
      user: user._id,
      role: user.role,
      action: 'LOGIN',
      details: `${user.name} logged in`,
    });

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

/**
 * @swagger
 * /forgot-password:
 *   post:
 *     summary: Request a password reset token
 *     tags: [Auth]
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!isEmail(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    logActivity({
      user: user._id,
      role: user.role,
      action: 'FORGOT_PASSWORD',
      details: `${user.name} requested a password reset`,
    });

    await sendEmail({
      to: email,
      subject: 'MediConnect - Password reset',
      text: `Use this token to reset your password (valid 1 hour): ${token}`,
    });

    const response = {
      message: 'Password reset link generated. Use the token below.',
      email,
    };
    if (!mailEnabled) {
      response.resetToken = token;
      response.note = 'Token is returned here for demo purposes. In production it would be emailed.';
    }
    res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    if (!token) return res.status(400).json({ message: 'Reset token is required' });
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords don't match" });
    }

    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    logActivity({
      user: user._id,
      role: user.role,
      action: 'PASSWORD_RESET',
      details: `${user.name} reset their password`,
    });

    res.status(200).json({ message: 'Password reset successfully. You can now login.' });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /change-password:
 *   patch:
 *     summary: Change own password (authenticated)
 *     tags: [Auth]
 */
router.patch('/change-password', checkToken(['admin', 'doctor', 'patient']), async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords don't match" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    logActivity({
      user: user._id,
      role: user.role,
      action: 'CHANGE_PASSWORD',
      details: `${user.name} changed their password`,
    });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get own profile
 *     tags: [Users]
 */
router.get('/user/profile', checkToken(['admin', 'doctor', 'patient']), async (req, res) => {
  try {
    const user = await User.findById(req.user.id, '-password -otp -resetPasswordToken');

    let doctor = null;
    let patient = null;

    if (user.role === 'doctor') {
      doctor = await Doctor.findOne({ user: user._id })
        .populate('department', 'name')
        .populate('user', 'name email contactNumber');
    } else if (user.role === 'patient') {
      patient = await Patient.findOne({ user: user._id });
    }

    res.status(200).json({ user, doctor, patient });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /user/profile:
 *   patch:
 *     summary: Update own profile
 *     tags: [Users]
 */
router.patch('/user/profile', checkToken(['admin', 'doctor', 'patient']), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const allowed = ['name', 'age', 'gender', 'address', 'contactNumber', 'emergencyContact'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });
    await user.save();

    if (user.role === 'patient') {
      const update = {};
      if (req.body.bloodGroup !== undefined) update.bloodGroup = req.body.bloodGroup;
      if (req.body.medicalHistory !== undefined) update.medicalHistory = req.body.medicalHistory;
      if (req.body.allergies !== undefined) update.allergies = req.body.allergies;
      if (Object.keys(update).length > 0) {
        await Patient.findOneAndUpdate({ user: user._id }, update, { upsert: true });
      }
    }

    if (user.role === 'doctor') {
      const update = {};
      if (req.body.specialization !== undefined) update.specialization = req.body.specialization;
      if (req.body.about !== undefined) update.about = req.body.about;
      if (req.body.qualifications !== undefined) update.qualifications = req.body.qualifications;
      if (req.body.experience !== undefined) update.experience = req.body.experience;
      if (req.body.consultationFee !== undefined) update.consultationFee = req.body.consultationFee;
      if (Object.keys(update).length > 0) {
        await Doctor.findOneAndUpdate({ user: user._id }, update);
      }
    }

    logActivity({
      user: user._id,
      role: user.role,
      action: 'PROFILE_UPDATED',
      details: `${user.name} updated their profile`,
    });

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /doctor/byUser/{userId}:
 *   get:
 *     summary: Look up doctor by user id
 *     tags: [Users]
 */
router.get('/doctor/byUser/:userId', checkToken(['admin', 'doctor', 'patient']), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.params.userId }).populate('department', 'name');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /doctors/count:
 *   get:
 *     summary: Public doctor/patient/appointment counts
 *     tags: [Users]
 */
router.get('/doctors/count', async (req, res) => {
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
