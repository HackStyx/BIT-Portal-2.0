const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User'); // Use the User model

// Fetch students based on criteria for teachers
router.get('/teacher/students', async (req, res) => {
  try {
    const { year, department, section } = req.query;

    // Build the query object
    const query = {};
    if (year && year !== 'all') query.year = year;
    if (department && department !== 'all') query.department = department;
    if (section && section !== 'all') query.section = section;

    // Fetch students based on the criteria or all if no criteria
    const students = await User.find(query);

    // Extract unique sections and departments from the students
    const sections = [...new Set(students.map(student => student.section))];
    const departments = [...new Set(students.map(student => student.department))];

    res.json({ success: true, students, sections, departments });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Error fetching students' });
  }
});

// Mark attendance for teachers
router.post('/teacher/attendance', async (req, res) => {
  try {
    const { attendanceData } = req.body;
    
    // Validate the incoming data
    if (!attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid attendance data format' 
      });
    }

    // Log the received data
    console.log('Received attendance data:', attendanceData);

    // Validate each record before insertion
    for (const record of attendanceData) {
      if (!record.usn || !record.year || !record.section || 
          !record.subject || !record.date || !record.status) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields in attendance record',
          invalidRecord: record
        });
      }
    }

    // For each attendance record, update if exists or insert if new
    const operations = attendanceData.map(record => ({
      updateOne: {
        filter: {
          usn: record.usn,
          subject: record.subject,
          date: new Date(record.date)
        },
        update: { $set: record },
        upsert: true // Create if doesn't exist
      }
    }));

    // Execute all operations
    const result = await Attendance.bulkWrite(operations);
    console.log('Attendance records updated:', result);

    res.json({ 
      success: true, 
      message: 'Attendance marked successfully',
      result
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error marking attendance',
      error: error.message 
    });
  }
});

module.exports = router;