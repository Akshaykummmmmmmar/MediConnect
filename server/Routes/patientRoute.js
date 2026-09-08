const express = require('express');
const User = require('../database/models/userSchema');
const Patient = require('../database/models/patientSchema');
const Appointment = require('../database/models/appointmentSchema');
const router = express.Router();
const checkToken = require('../middleware/checkToken');
const {
  getDoctorIdForUser,
  hasDoctorPatientRelationship,
  forbid,
} = require('../accessControl');
const { isObjectId } = require('../validate');

const paginate = (array, page = 1, limit = 10) => {
  const p = Number(page) || 1;
  const l = Number(limit) || 10;
  const start = (p - 1) * l;
  const items = array.slice(start, start + l);
  return {
    items,
    total: array.length,
    page: p,
    limit: l,
    totalPages: Math.ceil(array.length / l) || 1,
  };
};

router.get('/get/patients', checkToken(['admin', 'doctor']), async (req, res) => {
  try {
    const { page, limit, search } = req.query;

    let patientIds = null;
    if (req.user.role === 'doctor') {
      const myDoctorId = await getDoctorIdForUser(req.user.id);
      if (!myDoctorId) return forbid(res);
      const docs = await Appointment.find({ doctor: myDoctorId }).distinct('patient');
      patientIds = new Set(docs.map(id => id.toString()));
    }

    let patients = await User.find({ role: 'patient' }, '-password').lean();
    if (patientIds) {
      patients = patients.filter(p => patientIds.has(p._id.toString()));
    }
    if (search) {
      const s = search.toLowerCase();
      patients = patients.filter(
        p =>
          (p.name || '').toLowerCase().includes(s) ||
          (p.email || '').toLowerCase().includes(s) ||
          (p.contactNumber || '').toLowerCase().includes(s)
      );
    }

    const result = paginate(patients, page, limit);
    const pagePatientIds = result.items.map(patient => patient._id);
    const appointments = await Appointment.find({ patient: { $in: pagePatientIds } })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ date: -1, time: -1 })
      .lean();

    const today = new Date().toISOString().slice(0, 10);
    const activeStatuses = ['Pending', 'Confirmed', 'Booked'];
    const bookingsByPatient = new Map();

    appointments.forEach(appointment => {
      const key = appointment.patient.toString();
      const summary = bookingsByPatient.get(key) || {
        total: 0,
        recent: [],
        upcoming: null,
      };
      const booking = {
        _id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        doctorName: appointment.doctor?.user?.name || 'Doctor not assigned',
        specialization: appointment.doctor?.specialization || '',
      };
      summary.total += 1;
      if (summary.recent.length < 3) summary.recent.push(booking);
      if (
        activeStatuses.includes(appointment.status) &&
        appointment.date >= today &&
        (!summary.upcoming || appointment.date < summary.upcoming.date)
      ) {
        summary.upcoming = booking;
      }
      bookingsByPatient.set(key, summary);
    });

    result.items = result.items.map(patient => ({
      ...patient,
      bookingSummary: bookingsByPatient.get(patient._id.toString()) || {
        total: 0,
        recent: [],
        upcoming: null,
      },
    }));
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.get('/patient/profile/:id', checkToken(['admin', 'doctor', 'patient']), async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid patient id' });
    }

    if (req.user.role === 'patient' && req.user.id !== req.params.id) {
      return forbid(res);
    }

    if (req.user.role === 'doctor') {
      const myDoctorId = await getDoctorIdForUser(req.user.id);
      if (!myDoctorId || !(await hasDoctorPatientRelationship(myDoctorId, req.params.id))) {
        return forbid(res);
      }
    }

    const user = await User.findById(req.params.id, '-password');
    const patient = await Patient.findOne({ user: req.params.id });
    if (!user) return res.status(404).json({ message: 'Patient not found' });
    res.status(200).json({ user, patient });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

module.exports = router;
