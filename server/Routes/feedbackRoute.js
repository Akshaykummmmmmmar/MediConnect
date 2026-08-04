const express = require('express');
const Rating = require('../database/models/ratingSchema');
const Doctor = require('../database/models/docterSchema');
const User = require('../database/models/userSchema');
const checkToken = require('../middleware/checkToken');
const { sendNotification, logActivity } = require('../helpers');

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

router.get('/ratings/doctor/:id', async (req, res) => {
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
    const rating = await Rating.findOne({ appointment });
    res.status(200).json({ rated: Boolean(rating), rating });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

module.exports = router;
