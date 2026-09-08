const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { jwtSecret } = require('../config');

const connect = async dbName => {
  const uri = process.env.TEST_DB_URI || `mongodb://localhost:27017/${dbName}`;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
};

const resetDb = async () => {
  await new Promise(resolve => setTimeout(resolve, 50));
  const names = mongoose.modelNames();
  await Promise.allSettled(
    names.map(name => {
      try {
        return mongoose.model(name).deleteMany({});
      } catch {
        return Promise.resolve();
      }
    })
  );
};

const disconnect = async () => {
  await mongoose.disconnect();
};

const makeToken = (userId, role) =>
  jwt.sign({ id: String(userId), role }, jwtSecret);

const createUser = async ({ name, email, role = 'patient', isVerified = true }) => {
  const User = require('../database/models/userSchema');
  const password = await bcrypt.hash('testpass123', 4);
  const user = await User.create({ name, email, password, role, isVerified });
  return user;
};

const createDoctor = async user => {
  const Doctor = require('../database/models/docterSchema');
  const doctor = await Doctor.create({
    user: user._id,
    specialization: 'Cardiology',
    consultationFee: 500,
  });
  return doctor;
};

const createAppointment = async ({ patient, doctor, date, time, status = 'Confirmed' }) => {
  const Appointment = require('../database/models/appointmentSchema');
  return Appointment.create({
    patient,
    doctor,
    date,
    time,
    status,
    feeAmount: 500,
    paymentStatus: 'Pending',
  });
};

const createInvoice = async ({ patient, doctor }) => {
  const Invoice = require('../database/models/invoiceSchema');
  const count = await Invoice.countDocuments();
  return Invoice.create({
    invoiceNumber: `INV-TEST-${Date.now()}-${count + 1}`,
    patient,
    doctor,
    items: [{ description: 'Consultation', amount: 500 }],
    subtotal: 500,
    tax: 0,
    total: 500,
    status: 'Pending',
  });
};

const createPrescription = async ({ patient, doctor }) => {
  const Prescription = require('../database/models/prescriptionSchema');
  return Prescription.create({
    patient,
    doctor,
    findings: 'Routine check-up',
    medicines: [{ name: 'Paracetamol', dosage: '500mg', duration: '3 days' }],
  });
};

const createNotification = async ({ user, title = 'Test' }) => {
  const Notification = require('../database/models/notificationSchema');
  return Notification.create({ user, title, message: 'Test message' });
};

module.exports = {
  connect,
  resetDb,
  disconnect,
  makeToken,
  createUser,
  createDoctor,
  createAppointment,
  createInvoice,
  createPrescription,
  createNotification,
};