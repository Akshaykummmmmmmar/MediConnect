const mongoose = require('mongoose');
const User = require('./userSchema');

const doctorSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  image: {
    type: String,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
  age: String,
  specialization: String,
  experience: Number,
  licenseNumber: String,
  consultationFee: Number,
});

const Doctor = mongoose.model('docter', doctorSchema);

module.exports = Doctor;
