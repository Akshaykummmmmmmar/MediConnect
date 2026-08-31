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

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
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

prescriptionSchema.index({ patient: 1, createdAt: -1 });
prescriptionSchema.index({ doctor: 1, createdAt: -1 });
prescriptionSchema.index({ appointment: 1 });

const prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = prescription;
