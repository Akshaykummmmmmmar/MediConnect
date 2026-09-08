const mongoose = require('mongoose');

const isObjectId = value =>
  mongoose.Types.ObjectId.isValid(String(value || ''));

const isDateString = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));

const isValidTime = value =>
  typeof value === 'string' && /^\d{2}:\d{2} (AM|PM)$/.test(value.trim());

const isPositiveNumber = value =>
  value !== undefined &&
  value !== '' &&
  !Number.isNaN(Number(value)) &&
  Number(value) > 0;

module.exports = { isObjectId, isDateString, isValidTime, isPositiveNumber };