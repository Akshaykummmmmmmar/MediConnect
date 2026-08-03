const express = require('express');
const cors = require('cors');
const db = require('./database');
const userRoute = require('./Routes/userRoute');
const adminRoute = require('./Routes/adminRoute');
const patientRoute = require('./Routes/patientRoute');
const imageRoute = require('./Routes/imageRoute');
const departmentRoute = require('./Routes/departmentRoute');
const appointmentBook = require('./Routes/appointmentBook');
const prescriptionRoute = require('./Routes/prescriptionRoute');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use(userRoute);
app.use(adminRoute);
app.use(patientRoute);
app.use(imageRoute);
app.use(departmentRoute);
app.use(appointmentBook);
app.use(prescriptionRoute);

app.listen(4000, () => {
  console.log('Server is Running.....');
});
