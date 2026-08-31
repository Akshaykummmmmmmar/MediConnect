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
    quantity: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
  },
  { timestamps: true }
);

medicineSchema.index({ name: 1 });
medicineSchema.index({ expiryDate: 1 });

const Medicine = mongoose.model('medicine', medicineSchema);

module.exports = Medicine;
