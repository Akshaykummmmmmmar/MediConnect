const express = require('express');
const Invoice = require('../database/models/invoiceSchema');
const Doctor = require('../database/models/docterSchema');
const User = require('../database/models/userSchema');
const checkToken = require('../middleware/checkToken');
const { sendNotification, logActivity } = require('../helpers');

const router = express.Router();

const paginate = (array, page = 1, limit = 10) => {
  const p = Number(page) || 1;
  const l = Number(limit) || 10;
  const start = (p - 1) * l;
  const items = array.slice(start, start + l);
  return {
    items,
    total: array.length,
    page: p,
    limit: l,
    totalPages: Math.ceil(array.length / l) || 1,
  };
};

router.post('/invoices', checkToken(['admin', 'doctor']), async (req, res) => {
  try {
    const { appointment, patient, doctor, items = [], tax = 0 } = req.body;

    if (!patient || items.length === 0) {
      return res.status(400).json({ message: 'Patient and items are required' });
    }

    const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const total = Math.round((subtotal + subtotal * (Number(tax) / 100)) * 100) / 100;

    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-${String(Date.now()).slice(-8)}-${count + 1}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      appointment,
      patient,
      doctor,
      items,
      subtotal,
      tax: Number(tax),
      total,
      status: 'Pending',
    });

    const patientUser = await User.findById(patient);
    if (patientUser) {
      await sendNotification({
        user: patient._id,
        title: 'New Invoice',
        message: `An invoice of ₹${total} has been generated. Invoice No: ${invoiceNumber}.`,
        type: 'billing',
        relatedId: invoice._id,
      });
    }

    await logActivity({
      role: 'admin',
      action: 'INVOICE_CREATED',
      details: `Invoice ${invoiceNumber} for ₹${total} was created`,
    });

    res.status(201).json({ message: 'Invoice created', invoice });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.get(
  '/invoices/patient/:id',
  checkToken(['patient', 'admin']),
  async (req, res) => {
    try {
      const { page, limit } = req.query;
      const invoices = await Invoice.find({ patient: req.params.id })
        .populate('appointment')
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'name' },
        })
        .sort({ createdAt: -1 });

      const result = paginate(invoices, page, limit);
      res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
);

router.get('/invoices', checkToken(['admin']), async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;

    const invoices = await Invoice.find(filter)
      .populate('patient', 'name email')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      })
      .sort({ createdAt: -1 });

    const result = paginate(invoices, page, limit);
    res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.patch('/invoices/pay/:id', checkToken(['patient', 'admin']), async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status: 'Paid', paymentMethod: paymentMethod || 'Cash' },
      { new: true }
    );

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    await sendNotification({
      user: invoice.patient,
      title: 'Payment Successful',
      message: `Payment of ₹${invoice.total} for invoice ${invoice.invoiceNumber} was successful.`,
      type: 'billing',
      relatedId: invoice._id,
    });

    await logActivity({
      user: invoice.patient,
      role: 'patient',
      action: 'PAYMENT_MADE',
      details: `Invoice ${invoice.invoiceNumber} of ₹${invoice.total} was paid`,
    });

    res.status(200).json({ message: 'Payment successful', invoice });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

module.exports = router;
