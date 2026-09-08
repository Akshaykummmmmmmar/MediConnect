const express = require('express');
const MedicalRecord = require('../database/models/medicalRecordSchema');
const User = require('../database/models/userSchema');
const checkToken = require('../middleware/checkToken');
const { logActivity } = require('../helpers');
const {
  getDoctorIdForUser,
  hasDoctorPatientRelationship,
  forbid,
} = require('../accessControl');
const { isObjectId } = require('../validate');

const router = express.Router();

router.post('/medical-records', checkToken(['doctor', 'patient', 'admin']), async (req, res) => {
  try {
    const { patient, title, recordType, description, attachment, doctor, appointment } = req.body;

    if (!patient || !title) {
      return res.status(400).json({ message: 'Patient and title are required' });
    }

    if (!isObjectId(patient)) {
      return res.status(400).json({ message: 'Invalid patient id' });
    }

    if (req.user.role === 'patient' && req.user.id !== patient) {
      return forbid(res);
    }

    if (req.user.role === 'doctor') {
      const myDoctorId = await getDoctorIdForUser(req.user.id);
      if (!myDoctorId) return forbid(res);
      if (doctor && String(doctor) !== myDoctorId) {
        return forbid(res);
      }
      if (!(await hasDoctorPatientRelationship(myDoctorId, patient))) {
        return forbid(res);
      }
    }

    const patientUser = await User.findById(patient);
    if (!patientUser || patientUser.role !== 'patient') {
      return res.status(400).json({ message: 'Patient not found' });
    }

    const newRecord = await MedicalRecord.create({
      patient,
      doctor,
      appointment,
      title,
      recordType: recordType || 'other',
      description,
      attachment,
    });

    await logActivity({
      user: patient,
      role: 'patient',
      action: 'MEDICAL_RECORD_ADDED',
      details: `A medical record "${title}" was added`,
    });

    res.status(201).json({ message: 'Medical record added', record: newRecord });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.get(
  '/medical-records/patient/:id',
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

      const records = await MedicalRecord.find({ patient: patientId })
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'name' },
        })
        .sort({ createdAt: -1 });

      res.status(200).json(records);
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
);

router.get('/medical-records/:id', checkToken(['patient', 'doctor', 'admin']), async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id).populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' },
    });
    if (!record) return res.status(404).json({ message: 'Record not found' });

    if (req.user.role === 'patient' && record.patient.toString() !== req.user.id) {
      return forbid(res);
    }

    if (req.user.role === 'doctor') {
      const myDoctorId = await getDoctorIdForUser(req.user.id);
      const isMyRecord = record.doctor && record.doctor._id.toString() === myDoctorId;
      if (!isMyRecord && !(await hasDoctorPatientRelationship(myDoctorId, record.patient))) {
        return forbid(res);
      }
    }

    res.status(200).json(record);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.delete('/medical-records/:id', checkToken(['doctor', 'admin']), async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });

    if (req.user.role === 'doctor') {
      const myDoctorId = await getDoctorIdForUser(req.user.id);
      if (!record.doctor || record.doctor.toString() !== myDoctorId) {
        return forbid(res);
      }
    }

    await MedicalRecord.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Medical record deleted' });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

module.exports = router;