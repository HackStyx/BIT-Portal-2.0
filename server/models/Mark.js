const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    enum: ['Internal Assessment 1', 'Internal Assessment 2', 'Internal Assessment 3', 'Semester'],
    required: true
  },
  marks: {
    type: Number,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true,
    default: 100
  },
  semester: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Mark', markSchema); 