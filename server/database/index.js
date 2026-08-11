const mongoose = require('mongoose');
require('dotenv').config();

const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/projectdb';

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log('Database is connected');
  })
  .catch(e => {
    console.log('Database connection error:', e.message);
  });

module.exports = mongoose;
