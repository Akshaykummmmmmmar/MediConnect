const nodemailer = require('nodemailer');

require('dotenv').config();

const mailEnabled = process.env.MAIL_ENABLED === 'true';
const smtpPort = Number(process.env.SMTP_PORT) || 587;

let transporter = null;
if (mailEnabled) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error(
      'MAIL_ENABLED is true, but SMTP_USER or SMTP_PASS is missing. Configure Gmail SMTP in server/.env.'
    );
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: smtpPort,
    // Gmail uses STARTTLS on 587 and implicit TLS on 465.
    secure: smtpPort === 465,
    requireTLS: smtpPort === 587,
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
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
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
