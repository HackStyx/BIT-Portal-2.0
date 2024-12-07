const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const authMiddleware = require('../middleware/auth');
const TeacherAttendance = require('../models/TeacherAttendance');

// Get all teachers
router.get('/auth/admin/teachers', authMiddleware, async (req, res) => {
  try {
    const teachers = await Teacher.find({}, { password: 0 });
    res.json({ success: true, teachers });
  } catch (error) {
    console.error('Fetch teachers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create teacher
router.post('/auth/admin/register', authMiddleware, async (req, res) => {
  try {
    const teacher = new Teacher(req.body);
    await teacher.save();
    res.json({ success: true, message: 'Teacher created successfully' });
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update teacher
router.put('/auth/admin/update/:teacherId', authMiddleware, async (req, res) => {
  try {
    const teacher = await Teacher.findOneAndUpdate(
      { teacherId: req.params.teacherId },
      req.body,
      { new: true }
    );
    res.json({ success: true, message: 'Teacher updated successfully' });
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete teacher
router.delete('/auth/admin/delete/:teacherId', authMiddleware, async (req, res) => {
  try {
    await Teacher.findOneAndDelete({ teacherId: req.params.teacherId });
    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get teacher's attendance history
router.get('/teacher/attendance/:teacherId', authMiddleware, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { month, year } = req.query;

    console.log('Fetching attendance for:', { teacherId, month, year }); // Debug log

    // First find the teacher using teacherId string
    const teacher = await Teacher.findOne({ teacherId: teacherId });
    
    if (!teacher) {
      console.log('Teacher not found:', teacherId); // Debug log
      return res.status(404).json({ 
        success: false, 
        message: `Teacher not found with ID: ${teacherId}` 
      });
    }

    console.log('Found teacher:', teacher._id); // Debug log

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    console.log('Date range:', { startDate, endDate }); // Debug log

    const attendance = await TeacherAttendance.find({
      teacherId: teacher._id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: -1 });

    console.log('Found attendance records:', attendance.length); // Debug log

    // If no attendance records found, return default values
    if (!attendance.length) {
      return res.json({
        success: true,
        attendance: [],
        stats: {
          totalDays: 0,
          presentDays: 0,
          onTimePercentage: 0,
          totalWorkingHours: 0,
          totalBreakHours: 0
        }
      });
    }

    // Calculate statistics
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const totalWorkingHours = attendance.reduce((sum, a) => sum + (a.workingHours || 0), 0);
    const totalBreakHours = attendance.reduce((sum, a) => sum + (a.breakTime || 0), 0);

    const stats = {
      totalDays,
      presentDays,
      onTimePercentage: totalDays ? ((presentDays / totalDays) * 100).toFixed(2) : 0,
      totalWorkingHours: parseFloat(totalWorkingHours.toFixed(2)),
      totalBreakHours: parseFloat(totalBreakHours.toFixed(2))
    };

    console.log('Calculated stats:', stats); // Debug log

    res.json({
      success: true,
      attendance,
      stats
    });
  } catch (error) {
    console.error('Error in /teacher/attendance:', error); // Detailed error logging
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch attendance data',
      error: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
});

// Get last 10 days attendance
router.get('/teacher/recent-attendance/:teacherId', authMiddleware, async (req, res) => {
  try {
    const {teacherId } = req.params;
    const attendance= await TeacherAttendance.find({ teacherId })
      .sort({ date: -1 })
      .limit(10);

    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Error fetching recent attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent attendance' });
  }
});

module.exports = router;
