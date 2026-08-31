const express = require('express');
const Appointment = require('../database/models/appointmentSchema');
const Doctor = require('../database/models/docterSchema');
const User = require('../database/models/userSchema');
const Invoice = require('../database/models/invoiceSchema');
const checkToken = require('../middleware/checkToken');
const { sendNotification, logActivity } = require('../helpers');

const router = express.Router();

const to12Hour = timeStr => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
};

const getTimesForDoctor = doctor => {
  const start = doctor?.availability?.startTime || '09:00';
  const end = doctor?.availability?.endTime || '16:00';
  const slotMinutes = doctor?.availability?.slotDuration || 60;

  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const times = [];
  let cursor = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  while (cursor < endMinutes) {
    const h = Math.floor(cursor / 60);
    const m = cursor % 60;
    times.push(to12Hour(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`));
    cursor += slotMinutes;
  }
  return times;
};

const isDoctorWorkingOnDate = (doctor, dateStr) => {
  const workingDays = doctor?.availability?.workingDays || [1, 2, 3, 4, 5, 6];
  const day = new Date(dateStr).getDay();
  return workingDays.includes(day);
};

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

router.post(
  '/book/appointment',
  checkToken(['patient', 'admin']),
  async (req, res) => {
    try {
      const { doctorId, patientId, date, time, paymentMethod } = req.body;

      if (!doctorId || !patientId || !date || !time) {
        return res.json({
          success: false,
          message: 'All fields are required',
        });
      }

      const validMethods = ['Cash', 'Card', 'UPI', 'Insurance'];
      if (paymentMethod && !validMethods.includes(paymentMethod)) {
        return res.json({
          success: false,
          message: 'Invalid payment method',
        });
      }

      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.json({ success: false, message: 'Doctor not found' });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((selectedDate - today) / 86400000);
      if (diffDays < 0 || diffDays > 6) {
        return res.json({
          success: false,
          message: 'You can only book within the next 7 days',
        });
      }

      if (!isDoctorWorkingOnDate(doctor, date)) {
        return res.json({
          success: false,
          message: 'Doctor is not available on this day',
        });
      }

      if (!getTimesForDoctor(doctor).includes(time)) {
        return res.json({
          success: false,
          message: 'Invalid appointment time for this doctor',
        });
      }

      const booked = await Appointment.findOne({
        doctor: doctorId,
        date: date,
        time: time,
        status: { $in: ['Pending', 'Confirmed', 'Booked'] },
      });

      if (booked) {
        return res.json({
          success: false,
          message: 'Doctor not available at this time',
        });
      }

      const patient = await User.findById(patientId);
      if (!patient) {
        return res.json({ success: false, message: 'Patient not found' });
      }

      const feeAmount = Number(doctor.consultationFee) || 0;
      const paid = Boolean(paymentMethod);

      const appointment = new Appointment({
        doctor: doctorId,
        patient: patientId,
        date: date,
        time: time,
        status: 'Pending',
        feeAmount,
        paymentStatus: paid ? 'Paid' : 'Pending',
        paymentMethod: paid ? paymentMethod : '',
      });

      await appointment.save();

      let invoice = null;
      if (paid && feeAmount > 0) {
        const count = await Invoice.countDocuments();
        const invoiceNumber = `INV-${String(Date.now()).slice(-8)}-${count + 1}`;

        invoice = await Invoice.create({
          invoiceNumber,
          appointment: appointment._id,
          patient: patientId,
          doctor: doctorId,
          items: [{ description: `Consultation fee - Dr. ${doctor.user ? '' : ''}${doctor.specialization || 'Doctor'}`, amount: feeAmount }],
          subtotal: feeAmount,
          tax: 0,
          total: feeAmount,
          status: 'Paid',
          paymentMethod,
        });

        await sendNotification({
          user: patientId,
          title: 'Payment Successful',
          message: `Payment of ₹${feeAmount} for your appointment on ${date} at ${time} was successful. Invoice ${invoiceNumber} generated.`,
          type: 'billing',
          relatedId: invoice._id,
        });
      }

      await sendNotification({
        user: patientId,
        title: 'Appointment Booked',
        message: `Your appointment with Dr. ${doctor.user ? '' : ''}${doctor.specialization || 'Doctor'} is pending confirmation on ${date} at ${time}.`,
        type: 'appointment',
        relatedId: appointment._id,
      });

      const doctorUser = await User.findById(doctor.user);
      if (doctorUser) {
        await sendNotification({
          user: doctorUser._id,
          title: 'New Appointment Request',
          message: `${patient.name} requested an appointment on ${date} at ${time}.`,
          type: 'appointment',
          relatedId: appointment._id,
        });
      }

      await logActivity({
        user: patientId,
        role: 'patient',
        action: 'APPOINTMENT_BOOKED',
        details: `${patient.name} booked an appointment for ${date} at ${time}`,
      });

      if (paid && invoice) {
        await logActivity({
          user: patientId,
          role: 'patient',
          action: 'PAYMENT_MADE',
          details: `Invoice ${invoice.invoiceNumber} of ₹${feeAmount} was paid for the appointment`,
        });
      }

      res.json({
        success: true,
        message: paid ? 'Appointment booked and payment received' : 'Appointment booked successfully',
        appointment,
        invoice,
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  }
);

router.get(
  '/book/appointment-slots',
  checkToken(['patient', 'admin']),
  async (req, res) => {
    try {
      const { doctorId } = req.query;

      const today = new Date();
      const availableDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() + i);
        return d.toISOString().split('T')[0];
      });

      if (!doctorId) {
        return res.json({
          dates: availableDates,
          times: [
            '09:00 AM',
            '10:00 AM',
            '11:00 AM',
            '02:00 PM',
            '03:00 PM',
          ],
          booked: {},
          workingDays: [1, 2, 3, 4, 5, 6],
        });
      }

      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      const times = getTimesForDoctor(doctor);

      const bookedAppointments = await Appointment.find({
        doctor: doctorId,
        date: { $in: availableDates },
        status: { $in: ['Pending', 'Confirmed', 'Booked'] },
      });

      const booked = {};
      availableDates.forEach(date => {
        const dayBooked = bookedAppointments
          .filter(a => a.date === date)
          .map(a => a.time);
        booked[date] = isDoctorWorkingOnDate(doctor, date)
          ? dayBooked
          : [...times];
      });

      res.json({
        dates: availableDates,
        times,
        booked,
        workingDays: doctor.availability?.workingDays || [1, 2, 3, 4, 5, 6],
      });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
);

router.get('/get/all/appointments', checkToken(['admin']), async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;

    const allAppointments = await Appointment.find(filter)
      .populate('patient', 'name email contactNumber')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .sort({ createdAt: -1 });

    const result = paginate(allAppointments, page, limit);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.get('/doctor/:id', checkToken(['admin', 'doctor']), async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { page, limit, status } = req.query;

    const filter = { doctor: doctorId };
    if (status && status !== 'All') filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email age contactNumber')
      .sort({ date: 1, time: 1 });

    const result = paginate(appointments, page, limit);
    res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.get('/patient/:id', checkToken(['patient', 'admin', 'doctor']), async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const filter = { patient: req.params.id };
    if (status && status !== 'All') filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
        },
      })
      .sort({ date: 1, time: 1 });

    const result = paginate(appointments, page, limit);
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/cancel/:id', checkToken(['patient']), async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const patient = await User.findById(appointment.patient);
    if (patient) {
      await sendNotification({
        user: appointment.patient,
        title: 'Appointment Cancelled',
        message: `Your appointment on ${appointment.date} at ${appointment.time} has been cancelled.`,
        type: 'appointment',
        relatedId: appointment._id,
      });
    }

    const doctor = await Doctor.findById(appointment.doctor).populate('user');
    if (doctor?.user?._id) {
      await sendNotification({
        user: doctor.user._id,
        title: 'Appointment Cancelled',
        message: `A patient cancelled their appointment on ${appointment.date} at ${appointment.time}.`,
        type: 'appointment',
        relatedId: appointment._id,
      });
    }

    await logActivity({
      user: appointment.patient,
      role: 'patient',
      action: 'APPOINTMENT_CANCELLED',
      details: `Appointment on ${appointment.date} at ${appointment.time} was cancelled`,
    });

    res.json({ message: 'Appointment cancelled' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch('/appointment/:id/status', checkToken(['admin', 'doctor']), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid appointment status' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const patient = await User.findById(appointment.patient);
    const doctor = await Doctor.findById(appointment.doctor).populate('user');

    if (status === 'Confirmed') {
      if (patient) {
        await sendNotification({
          user: patient._id,
          title: 'Appointment Confirmed',
          message: `Your appointment on ${appointment.date} at ${appointment.time} has been confirmed.`,
          type: 'appointment',
          relatedId: appointment._id,
        });
      }
    } else if (status === 'No-show') {
      if (patient) {
        await sendNotification({
          user: patient._id,
          title: 'Marked as No-show',
          message: `Your appointment on ${appointment.date} at ${appointment.time} was marked as no-show.`,
          type: 'appointment',
          relatedId: appointment._id,
        });
      }
    }

    await logActivity({
      user: req.user?.id || doctor?.user?._id,
      role: req.user?.role || 'doctor',
      action: 'APPOINTMENT_STATUS_UPDATED',
      details: `Appointment ${req.params.id} marked as ${status}`,
    });

    return res.json(appointment);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.patch('/appointment/:id', checkToken(['admin', 'doctor']), async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'Completed' },
      { new: true }
    );

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const patient = await User.findById(appointment.patient);
    if (patient) {
      await sendNotification({
        user: patient._id,
        title: 'Consultation Completed',
        message: `Your consultation on ${appointment.date} has been completed. You can now view your prescription.`,
        type: 'appointment',
        relatedId: appointment._id,
      });
    }

    return res.json(appointment);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

module.exports = router;
