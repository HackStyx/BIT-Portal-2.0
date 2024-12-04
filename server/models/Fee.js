const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
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

module.exports = mongoose.model('Fee', feeSchema); 