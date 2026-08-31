const nodemailer = require('nodemailer');

require('dotenv').config();

const mailEnabled = process.env.MAIL_ENABLED === 'true';

let transporter = null;
if (mailEnabled) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const sendEmail = async ({ to, subject, text }) => {
  if (!mailEnabled) {
    console.log(`\n[MAIL DISABLED] To: ${to} | Subject: ${subject}\n${text}\n`);
    return { simulated: true };
  }
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || 'MediConnect <noreply@mediconnect.local>',
      to,
      subject,
      text,
    });
    return { sent: true };
  } catch (e) {
    console.log('Email send error:', e.message);
    return { sent: false, error: e.message };
  }
};

module.exports = { sendEmail, mailEnabled };
