const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  ageGroup: String,
  gender: String,
  hasLaptop: Boolean,
  bio: String,
  heardFrom: [String]
});

module.exports = mongoose.model('User', UserSchema);
