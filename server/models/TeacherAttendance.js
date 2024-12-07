const mongoose = require('mongoose');

const teacherAttendanceSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    type: String,
    required: function() {
      return this.status !== 'absent';
    }
  },
  checkOut: {
    type: String,
    required: function() {
      return this.status !== 'absent';
    }
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true
  },
  workingHours: {
    type: Number,
    default: 0
  },
  breakTime: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('TeacherAttendance', teacherAttendanceSchema); 