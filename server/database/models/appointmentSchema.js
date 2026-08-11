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
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-show', 'Booked'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ date: 1, time: 1 });
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ patient: 1, date: 1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
