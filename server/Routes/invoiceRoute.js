const express = require('express');
const Invoice = require('../database/models/invoiceSchema');
const Doctor = require('../database/models/docterSchema');
const User = require('../database/models/userSchema');
const checkToken = require('../middleware/checkToken');
const { sendNotification, logActivity } = require('../helpers');
const {
  getDoctorIdForUser,
  hasDoctorPatientRelationship,
  forbid,
} = require('../accessControl');
const { isObjectId } = require('../validate');

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

    if (!isObjectId(patient)) {
      return res.status(400).json({ message: 'Invalid patient id' });
    }

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.some(item => !item || typeof item.description !== 'string')
    ) {
      return res.status(400).json({ message: 'Each invoice item needs a description' });
    }

    if (req.user.role === 'doctor') {
      const myDoctorId = await getDoctorIdForUser(req.user.id);
      if (!myDoctorId || !doctor || String(doctor) !== myDoctorId) {
        return forbid(res);
      }
      if (!(await hasDoctorPatientRelationship(myDoctorId, patient))) {
        return forbid(res);
      }
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
        user: patientUser._id,
        title: 'New Invoice',
        message: `An invoice of ₹${total} has been generated. Invoice No: ${invoiceNumber}.`,
        type: 'billing',
        relatedId: invoice._id,
      });
    }

    await logActivity({
      user: req.user?.id,
      role: req.user?.role || 'admin',
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
  checkToken(['patient', 'admin', 'doctor']),
  async (req, res) => {
    try {
      const patientId = req.params.id;

      if (!isObjectId(patientId)) {
        return res.status(400).json({ message: 'Invalid patient id' });
      }

      if (req.user.role === 'patient' && req.user.id !== patientId) {
        return forbid(res);
      }

      if (req.user.role === 'doctor') {
        const myDoctorId = await getDoctorIdForUser(req.user.id);
        if (!myDoctorId || !(await hasDoctorPatientRelationship(myDoctorId, patientId))) {
          return forbid(res);
        }
      }

      const { page, limit } = req.query;
      const invoices = await Invoice.find({ patient: patientId })
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
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    if (req.user.role === 'patient' && invoice.patient.toString() !== req.user.id) {
      return forbid(res);
    }

    const { paymentMethod } = req.body;
    invoice.status = 'Paid';
    if (paymentMethod) invoice.paymentMethod = paymentMethod;
    await invoice.save();

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
