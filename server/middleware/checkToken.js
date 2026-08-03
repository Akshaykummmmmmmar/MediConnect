const jwt = require('jsonwebtoken');

const checkToken = roles => {
  return (req, res, next) => {
    try {
      const bearToken = req.headers.authorization;
      if (!bearToken) {
        return res
          .status(403)
          .json({ message: 'You are not authorized,please login' });
      }
      const token = bearToken.split(' ')[1];
      const SECRET_KEY = 'gghfhergyfgreherhuerhue';
      const decoded = jwt.verify(token, SECRET_KEY);
      console.log(decoded);

      if (!roles.includes(decoded.role)) {
        return res
          .status(403)
          .json({ message: 'You are not authorized,please login' });
      }

      next();
    } catch {
      return res
        .status(403)
        .json({ message: 'You are not authorized,please login' });
    }
  };
};

module.exports = checkToken;

// Error Fix!!
// const jwt = require('jsonwebtoken');

// const checkToken = roles => {
//   return (req, res, next) => {
//     try {
//       const bearToken = req.headers.authorization;

//       if (!bearToken) {
//         return res.status(403).json({ message: 'No token provided' });
//       }

//       const token = bearToken.split(' ')[1];

//       const SECRET_KEY = 'gghfhergyfgreherhuerhue';
//       const decoded = jwt.verify(token, SECRET_KEY);

//       console.log(decoded);

//       if (!roles.includes(decoded.role)) {
//         return res
//           .status(403)
//           .json({ message: 'Access denied: role mismatch' });
//       }

//       req.user = decoded; // useful for later

//       next();
//     } catch (err) {
//       console.log(err.message);
//       return res.status(403).json({ message: 'Invalid or expired token' });
//     }
//   };
// };

// module.exports = checkToken;
