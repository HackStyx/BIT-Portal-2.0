const mongoose = require('mongoose');

const profileImageSchema = new mongoose.Schema({
  usn: {
    type: String,
    required: true,
    unique: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ProfileImage', profileImageSchema); 