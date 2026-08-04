const mongoose = require('mongoose');

const medicalRecordSchema = mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'docter',
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    title: {
      type: String,
      required: true,
    },
    recordType: {
      type: String,
      enum: ['diagnosis', 'report', 'test', 'vaccination', 'surgery', 'other'],
      default: 'other',
    },
    description: {
      type: String,
    },
    attachment: {
      type: String,
    },
  },
  { timestamps: true }
);

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord;
