const express = require('express');
const User = require('../database/models/userSchema');
const Patient = require('../database/models/patientSchema');
const router = express.Router();
const checkToken = require('../middleware/checkToken');

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

    let patients = await User.find({ role: 'patient' }, '-password');
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
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.get('/patient/profile/:id', checkToken(['admin', 'doctor', 'patient']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    const patient = await Patient.findOne({ user: req.params.id });
    if (!user) return res.status(404).json({ message: 'Patient not found' });
    res.status(200).json({ user, patient });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

module.exports = router;
