const mongoose = require('mongoose');

const medicineSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: { type: String },
    manufacturer: { type: String },
    expiryDate: { type: Date },
    price: { type: Number, min: 0 },
  },
  { timestamps: true }
);

const Medicine = mongoose.model('medicine', medicineSchema);

module.exports = Medicine;
