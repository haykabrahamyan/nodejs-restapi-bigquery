const mongoose = require('mongoose');
const dbURI = 'mongodb://localhost:27017/api';

mongoose.connect(dbURI);

module.exports = mongoose;