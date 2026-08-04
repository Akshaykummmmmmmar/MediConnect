const express = require('express');
const Doctor = require('../database/models/docterSchema');
const User = require('../database/models/userSchema');
const Prescription = require('../database/models/prescriptionSchema');
const checkToken = require('../middleware/checkToken');
const { sendNotification } = require('../helpers');

const router = express.Router();

router.post(
  '/post/prescriptions',
  checkToken(['doctor', 'patient']),
  async (req, res) => {
    try {
      const newPrescription = await Prescription.create(req.body);

      const patient = await User.findById(req.body.patient);
      if (patient) {
        await sendNotification({
          user: patient._id,
          title: 'New Prescription',
          message: 'Your doctor has shared a new prescription. You can view and download it.',
          type: 'prescription',
          relatedId: newPrescription._id,
        });
      }

      res.status(201).json({
        success: true,
        message: 'Prescription added successfully',
        data: newPrescription,
      });
    } catch (e) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }
);

router.get(
  '/get/prescriptions/patients/:id',
  checkToken(['patient', 'doctor']),
  async (req, res) => {
    try {
      const getPrescription = await Prescription.find({
        patient: req.params.id,
      })
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'name email' },
        })
        .sort({ createdAt: -1 });

      return res.json(getPrescription);
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
);

module.exports = router;
