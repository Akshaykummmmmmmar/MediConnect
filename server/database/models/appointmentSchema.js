const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'docter',
    },

    date: String,

    time: String,

    status: {
      type: String,
      default: 'Booked',
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
