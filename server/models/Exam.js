const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  examName: {
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
  startTime: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  totalMarks: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema); 