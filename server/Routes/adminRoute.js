const express = require('express');
const bcrypt = require('bcrypt');
const Doctor = require('../database/models/docterSchema');
const User = require('../database/models/userSchema');
const Medicine = require('../database/models/medicinesSchema');
const Appointment = require('../database/models/appointmentSchema');
const Invoice = require('../database/models/invoiceSchema');
const ActivityLog = require('../database/models/activityLogSchema');
const checkToken = require('../middleware/checkToken');
const { validateDoctor, isEmail } = require('../validation');
const { logActivity } = require('../helpers');
const { forbid } = require('../accessControl');

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

/**
 * @swagger
 * /addAdmin:
 *   post:
 *     summary: Create a new admin (admin only)
 *     tags: [Admin]
 */
router.post('/addAdmin', checkToken(['admin']), async (req, res) => {
  try {
    const { name, email, password, confirmPassword, contactNumber } = req.body;

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords don't match" });

    if (!isEmail(email))
      return res.status(400).json({ message: 'Enter a valid email address' });

    if (name && name.trim().length < 3)
      return res.status(400).json({ message: 'Name must be at least 3 characters' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Admin already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      contactNumber,
      role: 'admin',
    });

    await logActivity({
      user: admin._id,
      role: 'admin',
      action: 'ADMIN_CREATED',
      details: `Admin account created for ${name}`,
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /adddoctor:
 *   post:
 *     summary: Add a new doctor (admin only)
 *     tags: [Admin]
 */
router.post('/adddoctor', checkToken(['admin']), async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      age,
      image,
      specialization,
      experience,
      licenseNumber,
      department,
      consultationFee,
      about,
      qualifications,
    } = req.body;

    const errors = validateDoctor(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    const emailMatch = await User.findOne({ email });
    if (emailMatch) {
      return res.status(400).json({ message: 'user already exists!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'doctor',
      age,
    });

    const doctor = await Doctor.create({
      user: user._id,
      age,
      image,
      specialization,
      experience,
      licenseNumber,
      department,
      consultationFee,
      about,
      qualifications,
    });

    await logActivity({
      user: req.user?.id || user._id,
      role: 'admin',
      action: 'DOCTOR_ADDED',
      details: `Doctor ${name} (${specialization}) was added`,
    });

    return res.status(201).json({
      message: 'Doctor added successfully',
      doctor: {
        _id: doctor._id,
        name: user.name,
        email: user.email,
        age: doctor.age,
        image: doctor.image,
        specialization: doctor.specialization,
        experience: doctor.experience,
        licenseNumber: doctor.licenseNumber,
        department: doctor.department,
        consultationFee: doctor.consultationFee,
        about: doctor.about,
        qualifications: doctor.qualifications,
        availability: doctor.availability,
      },
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /doctor/update/{id}:
 *   patch:
 *     summary: Update doctor profile or availability
 *     tags: [Admin]
 */
router.patch('/doctor/update/:id', checkToken(['admin', 'doctor']), async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    if (req.user.role === 'doctor' && doctor.user.toString() !== req.user.id) {
      return forbid(res);
    }

    const allowed = [
      'age',
      'image',
      'specialization',
      'experience',
      'licenseNumber',
      'department',
      'consultationFee',
      'about',
      'qualifications',
    ];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) doctor[field] = req.body[field];
    });

    if (req.body.availability !== undefined) {
      const { workingDays, startTime, endTime, slotDuration } = req.body.availability;
      doctor.availability = {
        workingDays: Array.isArray(workingDays) && workingDays.length > 0 ? workingDays : doctor.availability.workingDays,
        startTime: startTime || doctor.availability.startTime,
        endTime: endTime || doctor.availability.endTime,
        slotDuration: slotDuration || doctor.availability.slotDuration,
      };
    }

    await doctor.save();

    await logActivity({
      user: req.user?.id,
      role: req.user?.role || 'doctor',
      action: 'DOCTOR_UPDATED',
      details: `Doctor ${doctor.specialization || ''} profile was updated`,
    });

    res.status(200).json({ message: 'Doctor updated successfully', doctor });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /add/medicine:
 *   post:
 *     summary: Add a medicine to inventory (admin only)
 *     tags: [Inventory]
 */
router.post('/add/medicine', checkToken(['admin']), async (req, res) => {
  try {
    const { name, price, quantity, lowStockThreshold } = req.body;
    if (!name) return res.status(400).json({ message: 'Medicine name is required' });
    if (price === undefined || price === '' || Number(price) < 0) {
      return res.status(400).json({ message: 'Enter a valid price' });
    }
    if (quantity !== undefined && Number(quantity) < 0) {
      return res.status(400).json({ message: 'Enter a valid quantity' });
    }

    const payload = { ...req.body };
    if (quantity === undefined || quantity === '') payload.quantity = 0;
    if (lowStockThreshold === undefined || lowStockThreshold === '') payload.lowStockThreshold = 10;

    const addMedicine = await Medicine.create(payload);

    await logActivity({
      user: req.user?.id,
      role: 'admin',
      action: 'MEDICINE_ADDED',
      details: `Medicine ${name} was added to inventory`,
    });

    res.status(201).json({
      success: true,
      message: 'Medicine added successfully',
      data: addMedicine,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /medicine/update/{id}:
 *   patch:
 *     summary: Update medicine details/stock (admin only)
 *     tags: [Inventory]
 */
router.patch('/medicine/update/:id', checkToken(['admin']), async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

    await logActivity({
      user: req.user?.id,
      role: 'admin',
      action: 'MEDICINE_UPDATED',
      details: `Medicine ${medicine.name} was updated`,
    });

    res.status(200).json({ message: 'Medicine updated', data: medicine });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /medicine/delete/{id}:
 *   delete:
 *     summary: Delete a medicine (admin only)
 *     tags: [Inventory]
 */
router.delete('/medicine/delete/:id', checkToken(['admin']), async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

    await logActivity({
      user: req.user?.id,
      role: 'admin',
      action: 'MEDICINE_DELETED',
      details: `Medicine ${medicine.name} was removed`,
    });

    res.status(200).json({ message: 'Medicine deleted' });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /get/medicines/:
 *   get:
 *     summary: List medicines with search & pagination (authenticated)
 *     tags: [Inventory]
 */
router.get('/get/medicines/', checkToken(['admin', 'patient', 'doctor']), async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
      ];
    }
    const medicines = await Medicine.find(filter).sort({ createdAt: -1 });
    const result = paginate(medicines, page, limit);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /inventory/alerts:
 *   get:
 *     summary: Low-stock and expiring medicine alerts (admin only)
 *     tags: [Inventory]
 */
router.get('/inventory/alerts', checkToken(['admin']), async (req, res) => {
  try {
    const allMedicines = await Medicine.find();

    const lowStock = allMedicines.filter(
      m => m.quantity <= m.lowStockThreshold
    );

    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const expiringSoon = allMedicines.filter(
      m => m.expiryDate && new Date(m.expiryDate) <= in30Days
    );

    const expired = allMedicines.filter(
      m => m.expiryDate && new Date(m.expiryDate) < new Date()
    );

    res.status(200).json({
      lowStock,
      expiringSoon,
      expired,
      counts: {
        lowStock: lowStock.length,
        expiringSoon: expiringSoon.length,
        expired: expired.length,
      },
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /doctors/get:
 *   get:
 *     summary: List doctors with search, department & rating filters
 *     tags: [Admin]
 */
router.get(
  '/doctors/get',
  checkToken(['admin', 'patient', 'doctor']),
  async (req, res) => {
    try {
      const { search, department, minRating, page, limit } = req.query;

      let doctors = await Doctor.find()
        .populate('user', 'name email role')
        .populate('department', 'name description');

      if (search) {
        const s = search.toLowerCase();
        doctors = doctors.filter(
          d =>
            (d.user?.name || '').toLowerCase().includes(s) ||
            (d.specialization || '').toLowerCase().includes(s) ||
            (d.department?.name || '').toLowerCase().includes(s)
        );
      }

      if (department) {
        doctors = doctors.filter(
          d => d.department?._id?.toString() === department || d.department?.name === department
        );
      }

      const Rating = require('../database/models/ratingSchema');
      const ratings = await Rating.find();
      doctors = doctors.map(d => {
        const docRatings = ratings.filter(r => r.doctor.toString() === d._id.toString());
        const avg =
          docRatings.length > 0
            ? Math.round((docRatings.reduce((s, r) => s + r.rating, 0) / docRatings.length) * 10) / 10
            : 0;
        const totalRatings = docRatings.length;
        return { ...d._doc, avgRating: avg, totalRatings };
      });

      if (minRating) {
        doctors = doctors.filter(d => d.avgRating >= Number(minRating));
      }

      const result = paginate(doctors, page, limit);
      return res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
);

/**
 * @swagger
 * /doctor/delete/{id}:
 *   delete:
 *     summary: Delete a doctor and linked user (admin only)
 *     tags: [Admin]
 */
router.delete('/doctor/delete/:id', checkToken(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    if (doctor?.user) {
      await User.findByIdAndDelete(doctor.user);
    }
    await Doctor.findByIdAndDelete(id);

    await logActivity({
      user: req.user?.id,
      role: 'admin',
      action: 'DOCTOR_DELETED',
      details: `Doctor ${doctor?.user?.name || id} was removed`,
    });

    return res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /analytics/overview:
 *   get:
 *     summary: Dashboard analytics (admin only)
 *     tags: [Analytics]
 */
router.get('/analytics/overview', checkToken(['admin']), async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateMatch = {};
    if (from) dateMatch.$gte = new Date(from);
    if (to) dateMatch.$lte = new Date(to);
    const invoiceQuery = {};
    if (from || to) invoiceQuery.createdAt = dateMatch;

    const [doctors, patients, appointments, invoices, ratings] = await Promise.all([
      Doctor.countDocuments(),
      User.countDocuments({ role: 'patient' }),
      Appointment.countDocuments(),
      Invoice.find(from || to ? invoiceQuery : {}),
      require('../database/models/ratingSchema').find(),
    ]);

    const statusBreakdown = {};
    const statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-show', 'Booked'];
    await Promise.all(
      statuses.map(async s => {
        statusBreakdown[s] = await Appointment.countDocuments({ status: s });
      })
    );

    const appointmentsPerDoctorRaw = await Appointment.aggregate([
      { $group: { _id: '$doctor', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const doctorIds = appointmentsPerDoctorRaw.map(d => d._id);
    const doctorsRaw = await Doctor.find({ _id: { $in: doctorIds } }).populate('user', 'name');
    const appointmentsPerDoctor = appointmentsPerDoctorRaw.map(d => {
      const doc = doctorsRaw.find(x => x._id.toString() === d._id.toString());
      return { name: doc?.user?.name || 'Unknown', count: d.count };
    });

    const appointmentsPerDay = await Appointment.aggregate([
      { $group: { _id: '$date', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 14 },
    ]);

    const totalRevenue = invoices
      .filter(i => i.status === 'Paid')
      .reduce((sum, i) => sum + (i.total || 0), 0);

    const pendingRevenue = invoices
      .filter(i => i.status === 'Pending')
      .reduce((sum, i) => sum + (i.total || 0), 0);

    const avgRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length) * 10) / 10
        : 0;

    res.status(200).json({
      counts: { doctors, patients, appointments, invoices: invoices.length },
      statusBreakdown,
      appointmentsPerDoctor,
      appointmentsPerDay: appointmentsPerDay.map(d => ({ date: d._id, count: d.count })),
      revenue: { totalRevenue, pendingRevenue },
      avgRating,
      ratingsCount: ratings.length,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /activity-logs:
 *   get:
 *     summary: Admin audit trail
 *     tags: [Analytics]
 */
router.get('/activity-logs', checkToken(['admin']), async (req, res) => {
  try {
    const { page, limit } = req.query;
    const logs = await ActivityLog.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    const result = paginate(logs, page, limit);
    res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

module.exports = router;
