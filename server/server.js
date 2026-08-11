require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const db = require('./database');
const { initSocket } = require('./socket');
const userRoute = require('./Routes/userRoute');
const adminRoute = require('./Routes/adminRoute');
const patientRoute = require('./Routes/patientRoute');
const imageRoute = require('./Routes/imageRoute');
const departmentRoute = require('./Routes/departmentRoute');
const appointmentBook = require('./Routes/appointmentBook');
const prescriptionRoute = require('./Routes/prescriptionRoute');
const feedbackRoute = require('./Routes/feedbackRoute');
const medicalRecordRoute = require('./Routes/medicalRecordRoute');
const invoiceRoute = require('./Routes/invoiceRoute');
const notificationRoute = require('./Routes/notificationRoute');
const exportRoute = require('./Routes/exportRoute');

const PORT = Number(process.env.PORT) || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.static('public'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later.' },
});
app.use(['/login', '/signUp/register', '/verify-otp', '/resend-otp', '/forgot-password', '/reset-password'], authLimiter);

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MediConnect Hospital Management System API',
      version: '1.0.0',
      description:
        'MERN hospital management: auth, doctors, patients, appointments, prescriptions, medical records, invoices, notifications, activity logs, ratings, pharmacy inventory.',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./Routes/*.js'],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
});

app.use(userRoute);
app.use(adminRoute);
app.use(patientRoute);
app.use(imageRoute);
app.use(departmentRoute);
app.use(appointmentBook);
app.use(prescriptionRoute);
app.use(feedbackRoute);
app.use(medicalRecordRoute);
app.use(invoiceRoute);
app.use(notificationRoute);
app.use(exportRoute);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err.message);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body too large' });
  }
  res.status(500).json({ message: 'Internal server error' });
});

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API docs available at http://localhost:${PORT}/api-docs`);
});
