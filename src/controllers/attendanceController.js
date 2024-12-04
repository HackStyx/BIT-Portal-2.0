const Attendance = require('../models/Attendance');

exports.getStudentAttendance = async (req, res) => {
  try {
    const { usn } = req.params;
    
    const records = await Attendance.find({ usn }).sort({ date: -1 });
    
    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === 'present').length;
    const absentDays = records.filter(r => r.status === 'absent').length;
    const overallPercentage = totalDays ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      attendance: {
        records,
        totalDays,
        presentDays,
        absentDays,
        overallPercentage
      }
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: 'Error fetching attendance data' });
  }
}; 