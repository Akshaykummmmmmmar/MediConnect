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
  about: {
    type: String,
  },
  qualifications: {
    type: String,
  },
  availability: {
    workingDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5, 6],
    },
    startTime: {
      type: String,
      default: '09:00',
    },
    endTime: {
      type: String,
      default: '16:00',
    },
    slotDuration: {
      type: Number,
      default: 60,
    },
  },
});

const Doctor = mongoose.model('docter', doctorSchema);

module.exports = Doctor;
