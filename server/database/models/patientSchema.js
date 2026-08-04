const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  age: Number,
  bloodGroup: String,
  medicalHistory: String,
  allergies: {
    type: String,
  },
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
