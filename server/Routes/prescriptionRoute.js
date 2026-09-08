const express = require('express');
const Doctor = require('../database/models/docterSchema');
const User = require('../database/models/userSchema');
const Appointment = require('../database/models/appointmentSchema');
const Prescription = require('../database/models/prescriptionSchema');
const checkToken = require('../middleware/checkToken');
const { sendNotification, logActivity } = require('../helpers');
const {
  getDoctorIdForUser,
  hasDoctorPatientRelationship,
  forbid,
} = require('../accessControl');
const { isObjectId } = require('../validate');

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

      if (!isObjectId(patient) || !isObjectId(doctor)) {
        return res.status(400).json({ message: 'Invalid patient or doctor id' });
      }

      const myDoctorId = await getDoctorIdForUser(req.user.id);
      if (!myDoctorId || doctor !== myDoctorId) {
        return forbid(res);
      }

      if (appointment && isObjectId(appointment)) {
        const existingAppointment = await Appointment.findById(appointment);
        if (
          !existingAppointment ||
          existingAppointment.doctor.toString() !== myDoctorId ||
          existingAppointment.patient.toString() !== patient
        ) {
          return res.status(400).json({
            message: 'Appointment does not belong to this doctor and patient',
          });
        }
      } else if (appointment) {
        return res.status(400).json({ message: 'Invalid appointment id' });
      } else if (!(await hasDoctorPatientRelationship(myDoctorId, patient))) {
        return forbid(res);
      }

      const patientUser = await User.findById(patient);
      if (!patientUser || patientUser.role !== 'patient') {
        return res.status(400).json({ message: 'Patient not found' });
      }

      const newPrescription = await Prescription.create({
        ...req.body,
        doctor: myDoctorId,
        patient: patientUser._id,
      });

      await sendNotification({
        user: patientUser._id,
        title: 'New Prescription',
        message: 'Your doctor has shared a new prescription. You can view and download it.',
        type: 'prescription',
        relatedId: newPrescription._id,
      });

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
  checkToken(['patient', 'doctor', 'admin']),
  async (req, res) => {
    try {
      const patientId = req.params.id;

      if (!isObjectId(patientId)) {
        return res.status(400).json({ message: 'Invalid patient id' });
      }

      if (req.user.role === 'patient' && req.user.id !== patientId) {
        return forbid(res);
      }

      if (req.user.role === 'doctor') {
        const myDoctorId = await getDoctorIdForUser(req.user.id);
        if (!myDoctorId || !(await hasDoctorPatientRelationship(myDoctorId, patientId))) {
          return forbid(res);
        }
      }

      const getPrescription = await Prescription.find({
        patient: patientId,
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
