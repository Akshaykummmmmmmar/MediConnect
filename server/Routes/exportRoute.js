const express = require('express');
const User = require('../database/models/userSchema');
const Doctor = require('../database/models/docterSchema');
const Appointment = require('../database/models/appointmentSchema');
const Medicine = require('../database/models/medicinesSchema');
const checkToken = require('../middleware/checkToken');

const router = express.Router();

const toCsv = rows => {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = value => {
    const v = value === null || value === undefined ? '' : String(value);
    return `"${v.replace(/"/g, '""')}"`;
  };
  return [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\r\n');
};

const sendCsv = (res, filename, rows) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(toCsv(rows));
};

router.get('/export/patients.csv', checkToken(['admin']), async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }, '-password');
    const rows = patients.map(p => ({
      Name: p.name,
      Email: p.email,
      Age: p.age,
      Gender: p.gender,
      Contact: p.contactNumber,
      Address: p.address,
      'Emergency Contact': p.emergencyContact,
      Registered: p.createdAt ? new Date(p.createdAt).toISOString() : '',
    }));
    sendCsv(res, 'patients.csv', rows);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.get('/export/doctors.csv', checkToken(['admin']), async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('user', 'name email').populate('department', 'name');
    const rows = doctors.map(d => ({
      Name: d.user?.name,
      Email: d.user?.email,
      Specialization: d.specialization,
      Experience: d.experience,
      Department: d.department?.name,
      'Consultation Fee': d.consultationFee,
      'License Number': d.licenseNumber,
    }));
    sendCsv(res, 'doctors.csv', rows);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.get('/export/appointments.csv', checkToken(['admin']), async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });
    const rows = appointments.map(a => ({
      Date: a.date,
      Time: a.time,
      Patient: a.patient?.name,
      'Patient Email': a.patient?.email,
      Doctor: a.doctor?.user?.name,
      Status: a.status,
      Booked: a.createdAt ? new Date(a.createdAt).toISOString() : '',
    }));
    sendCsv(res, 'appointments.csv', rows);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.get('/export/medicines.csv', checkToken(['admin']), async (req, res) => {
  try {
    const medicines = await Medicine.find();
    const rows = medicines.map(m => ({
      Name: m.name,
      Description: m.description,
      Manufacturer: m.manufacturer,
      Quantity: m.quantity,
      'Expiry Date': m.expiryDate ? new Date(m.expiryDate).toISOString() : '',
      Price: m.price,
    }));
    sendCsv(res, 'medicines.csv', rows);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

module.exports = router;
