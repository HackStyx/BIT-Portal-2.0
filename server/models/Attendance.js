const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  usn: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema); 