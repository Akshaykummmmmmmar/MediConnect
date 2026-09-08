const express = require('express');
const Rating = require('../database/models/ratingSchema');
const Doctor = require('../database/models/docterSchema');
const Appointment = require('../database/models/appointmentSchema');
const checkToken = require('../middleware/checkToken');
const { sendNotification, logActivity } = require('../helpers');
const { forbid } = require('../accessControl');
const { isObjectId } = require('../validate');

const router = express.Router();

router.post('/ratings', checkToken(['patient']), async (req, res) => {
  try {
    const { doctor, patient, appointment, rating, review } = req.body;

    if (!doctor || !patient || !rating) {
      return res.status(400).json({ message: 'Doctor, patient and rating are required' });
    }
    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    if (!isObjectId(doctor) || !isObjectId(patient)) {
      return res.status(400).json({ message: 'Invalid doctor or patient id' });
    }
    if (patient !== req.user.id) {
      return forbid(res);
    }
    if (appointment && isObjectId(appointment)) {
      const existingAppointment = await Appointment.findById(appointment);
      if (
        !existingAppointment ||
        existingAppointment.patient.toString() !== patient ||
        existingAppointment.doctor.toString() !== doctor
      ) {
        return res.status(400).json({ message: 'Appointment does not match this doctor and patient' });
      }
    } else if (appointment) {
      return res.status(400).json({ message: 'Invalid appointment id' });
    }

    const existing = await Rating.findOne({ doctor, appointment });
    if (existing) {
      existing.rating = Number(rating);
      existing.review = review || existing.review;
      await existing.save();
      return res.status(200).json({ message: 'Rating updated', rating: existing });
    }

    const newRating = await Rating.create({
      doctor,
      patient,
      appointment,
      rating: Number(rating),
      review: review || '',
    });

    const doctorDoc = await Doctor.findById(doctor).populate('user', 'name');
    if (doctorDoc?.user?._id) {
      await sendNotification({
        user: doctorDoc.user._id,
        title: 'New Rating Received',
        message: `A patient rated you ${rating}/5.`,
        type: 'rating',
        relatedId: newRating._id,
      });
    }

    await logActivity({
      user: patient,
      role: 'patient',
      action: 'RATING_SUBMITTED',
      details: `Patient rated a doctor ${rating}/5`,
    });

    res.status(201).json({ message: 'Rating submitted successfully', rating: newRating });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.get('/ratings/doctor/:id', checkToken(['admin', 'doctor', 'patient']), async (req, res) => {
  try {
    const ratings = await Rating.find({ doctor: req.params.id })
      .populate('patient', 'name')
      .sort({ createdAt: -1 });

    const avg =
      ratings.length > 0
        ? Math.round((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length) * 10) / 10
        : 0;

    res.status(200).json({ ratings, average: avg, count: ratings.length });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.get('/ratings/check', checkToken(['patient']), async (req, res) => {
  try {
    const { appointment } = req.query;
    if (!isObjectId(appointment)) {
      return res.status(400).json({ message: 'Invalid appointment id' });
    }

    const existingAppointment = await Appointment.findById(appointment);
    if (!existingAppointment || existingAppointment.patient.toString() !== req.user.id) {
      return forbid(res);
    }

    const rating = await Rating.findOne({ appointment });
    res.status(200).json({ rated: Boolean(rating), rating });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

module.exports = router;
