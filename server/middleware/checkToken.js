const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

const checkToken = roles => {
  return (req, res, next) => {
    try {
      const bearerToken = req.headers.authorization;
      if (!bearerToken) {
        return res
          .status(403)
          .json({ message: 'You are not authorized, please login' });
      }
      const token = bearerToken.split(' ')[1];
      if (!token) {
        return res
          .status(403)
          .json({ message: 'You are not authorized, please login' });
      }
      const decoded = jwt.verify(token, jwtSecret);

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