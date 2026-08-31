const express = require('express');
const Doctor = require('../database/models/docterSchema');
const User = require('../database/models/userSchema');
const Prescription = require('../database/models/prescriptionSchema');
const checkToken = require('../middleware/checkToken');
const { sendNotification, logActivity } = require('../helpers');

const router = express.Router();

/**
 * @swagger
 * /post/prescriptions:
 *   post:
 *     summary: Create a prescription for a patient (doctor only)
 *     tags: [Prescriptions]
 */
router.post(
  '/post/prescriptions',
  checkToken(['doctor']),
  async (req, res) => {
    try {
      const { patient, doctor, appointment } = req.body;
      if (!patient || !doctor) {
        return res.status(400).json({ message: 'Patient and doctor are required' });
      }

      const newPrescription = await Prescription.create(req.body);

      const patientUser = await User.findById(patient);
      if (patientUser) {
        await sendNotification({
          user: patient._id,
          title: 'New Prescription',
          message: 'Your doctor has shared a new prescription. You can view and download it.',
          type: 'prescription',
          relatedId: newPrescription._id,
        });
      }

      await logActivity({
        user: req.user?.id,
        role: 'doctor',
        action: 'PRESCRIPTION_POSTED',
        details: `Prescription posted for patient ${patientUser?.name || patient}`,
      });

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

/**
 * @swagger
 * /get/prescriptions/patients/{id}:
 *   get:
 *     summary: List a patient's prescriptions
 *     tags: [Prescriptions]
 */
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
