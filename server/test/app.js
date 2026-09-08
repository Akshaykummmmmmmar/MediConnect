const express = require('express');

const app = express();
app.use(express.json());

app.use(require('../Routes/userRoute'));
app.use(require('../Routes/adminRoute'));
app.use(require('../Routes/patientRoute'));
app.use(require('../Routes/appointmentBook'));
app.use(require('../Routes/prescriptionRoute'));
app.use(require('../Routes/medicalRecordRoute'));
app.use(require('../Routes/invoiceRoute'));
app.use(require('../Routes/notificationRoute'));
app.use(require('../Routes/feedbackRoute'));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

module.exports = app;