const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY =
  process.env.JWT_SECRET || 'gghfhergyfgreherhuerhue';

const checkToken = roles => {
  return (req, res, next) => {
    try {
      const bearToken = req.headers.authorization;
      if (!bearToken) {
        return res
          .status(403)
          .json({ message: 'You are not authorized, please login' });
      }
      const token = bearToken.split(' ')[1];
      const decoded = jwt.verify(token, SECRET_KEY);

      if (!roles.includes(decoded.role)) {
        return res
          .status(403)
          .json({ message: 'You are not authorized, please login' });
      }

      req.user = decoded;
      next();
    } catch {
      return res
        .status(403)
        .json({ message: 'You are not authorized, please login' });
    }
  };
};

module.exports = checkToken;
