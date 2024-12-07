const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  faculty: {
    type: String,
    required: true
  },
  responses: [{
    questionId: {
      type: Number,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  }],
  semester: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent multiple submissions
feedbackSchema.index({ studentId: 1, subject: 1, academicYear: 1 }, { unique: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback; 