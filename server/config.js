require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

if (isProduction && !jwtSecret) {
  throw new Error(
    'JWT_SECRET is required in production. Set a strong random value in server/.env and make sure NODE_ENV is set.'
  );
}

if (jwtSecret && jwtSecret.length < 32 && isProduction) {
  throw new Error('JWT_SECRET must be at least 32 characters in production.');
}

module.exports = { isProduction, jwtSecret, jwtExpiresIn };