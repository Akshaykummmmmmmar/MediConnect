const mongoose = require('mongoose');

const ratingSchema = mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'docter',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    review: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

ratingSchema.index({ doctor: 1, appointment: 1 }, { unique: true, sparse: true });

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
