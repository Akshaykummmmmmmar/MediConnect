/**
 * Admin seed script.
 *
 * Creates the first admin account (and optionally sample departments).
 * Run from the server directory:
 *   node seed.js
 *
 * Use ADMIN_EMAIL / ADMIN_PASSWORD env vars to override the defaults.
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./database');
const User = require('./database/models/userSchema');
const Department = require('./database/models/department');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mediconnect.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'System Admin';

const SEED_DEPARTMENTS = [
  { name: 'Cardiology', description: 'Heart and cardiovascular care' },
  { name: 'Orthopedics', description: 'Bones, joints and muscles' },
  { name: 'Pediatrics', description: 'Care for infants and children' },
  { name: 'Neurology', description: 'Brain and nervous system' },
  { name: 'Dermatology', description: 'Skin, hair and nails' },
  { name: 'General Medicine', description: 'Primary and preventive care' },
];

const run = async () => {
  try {
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`Admin already exists (${ADMIN_EMAIL}). Skipping.`);
    } else {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        contactNumber: '0000000000',
      });
      console.log(`Admin created → email: ${ADMIN_EMAIL}, password: ${ADMIN_PASSWORD}`);
    }

    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      await Department.insertMany(SEED_DEPARTMENTS);
      console.log(`Seeded ${SEED_DEPARTMENTS.length} departments.`);
    } else {
      console.log(`Departments already exist (${deptCount}). Skipping.`);
    }

    console.log('Seed complete.');
    process.exit(0);
  } catch (e) {
    console.error('Seed failed:', e.message);
    process.exit(1);
  }
};

run();
