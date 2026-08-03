const express = require('express');
const Appointment = require('../database/models/appointmentSchema');
const Doctor = require('../database/models/docterSchema');
const User = require('../database/models/userSchema');
const checkToken = require('../middleware/checkToken');

const router = express.Router();

router.post(
  '/book/appointment',
  checkToken(['patient', 'admin']),
  async (req, res) => {
    try {
      const { doctorId, patientId, date, time } = req.body;

      const today = new Date();

      const availableDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() + i);
        return d.toISOString().split('T')[0];
      });

      const availableTimes = [
        '09:00 AM',
        '10:00 AM',
        '11:00 AM',
        '02:00 PM',
        '03:00 PM',
      ];

      if (!availableDates.includes(date)) {
        return res.json({
          success: false,
          message: 'Invalid appointment date',
        });
      }

      if (!availableTimes.includes(time)) {
        return res.json({
          success: false,
          message: 'Invalid appointment time',
        });
      }

      const booked = await Appointment.findOne({
        doctor: doctorId,
        date: date,
        time: time,
      });

      if (booked) {
        return res.json({
          success: false,
          message: 'Doctor not available at this time',
        });
      }

      const appointment = new Appointment({
        doctor: doctorId,
        patient: patientId,
        date: date,
        time: time,
      });

      await appointment.save();

      res.json({
        success: true,
        message: 'Appointment booked successfully',
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  }
);

router.get('/get/all/appointments', async (req, res) => {
  try {
    const getAppointments = await Appointment.find()
      .populate('patient', 'name email')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email',
        },
      });
    return res.status(200).json(getAppointments);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.get(
  '/book/appointment-slots',
  checkToken(['patient', 'admin']),
  (req, res) => {
    const availableDates = [
      '2026-03-18',
      '2026-03-19',
      '2026-03-20',
      '2026-03-21',
      '2026-03-22',
      '2026-03-23',
      '2026-03-24',
      '2026-03-25',
      '2026-03-26',
    ];

    const availableTimes = [
      '09:00 AM',
      '10:00 AM',
      '11:00 AM',
      '02:00 PM',
      '03:00 PM',
    ];

    res.json({
      dates: availableDates,
      times: availableTimes,
    });
  }
);

router.get('/doctor/:id', async (req, res) => {
  try {
    const doctorId = req.params.id;
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate('patient', 'name email')
      .sort({ date: 1 });

    res.status(200).json(appointments);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.get('/patient/:id', async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.params.id,
    }).populate({
      path: 'doctor',
      populate: {
        path: 'user',
      },
    });

    res.json(appointments);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/cancel/:id', checkToken(['patient']), async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ message: 'Appointment cancelled' });
});

router.patch('/appointment/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'Completed' },
      { new: true }
    );

    return res.json(appointment);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

module.exports = router;
