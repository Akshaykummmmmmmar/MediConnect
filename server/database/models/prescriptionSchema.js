const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'docter',
      required: true,
    },

    findings: {
      type: String,
    },

    diagnosis: {
      type: String,
    },

    medicines: [
      {
        name: String,
        dosage: String,
        duration: String,
      },
    ],

    advice: {
      type: String,
    },

    followUp: {
      type: Date,
    },
  },
  { timestamps: true }
);

const prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = prescription;
