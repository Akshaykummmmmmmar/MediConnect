const mongoose = require('mongoose');

mongoose
  .connect('mongodb://localhost:27017/projectdb')
  .then(() => {
    console.log('Database is connected');
  })
  .catch(e => {
    console.log(e);
  });

module.exports = mongoose;
