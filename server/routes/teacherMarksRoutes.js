const express = require('express');
const router = express.Router();
const Mark = require('../models/Mark');
const User = require('../models/User');

// Fetch students based on criteria for marks entry
router.get('/teacher/students-for-marks', async (req, res) => {
  try {
    const { year, department, section } = req.query;

    // Build the query object only if filters are selected
    const query = {};
    if (year && year !== 'all') query.year = year;
    if (department && department !== 'all') query.department = department;
    if (section && section !== 'all') query.section = section;

    // Fetch students based on the criteria or all students if no criteria
    const students = await User.find(query).sort({ usn: 1 }); // Sort by USN

    // Extract unique sections and departments from all students
    const allStudents = await User.find({});
    const sections = [...new Set(allStudents.map(student => student.section))];
    const departments = [...new Set(allStudents.map(student => student.department))];
    const years = [...new Set(allStudents.map(student => student.year))];

    res.json({ 
      success: true, 
      students: students.map(student => ({
        id: student._id,
        usn: student.usn,
        name: student.name,
        year: student.year,
        department: student.department,
        section: student.section,
        marks: ''
      })),
      sections,
      departments,
      years
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Error fetching students' });
  }
});

// Save marks for multiple students
router.post('/teacher/marks', async (req, res) => {
  try {
    const { marksData } = req.body;
    
    if (!marksData || !Array.isArray(marksData)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid marks data format' 
      });
    }

    // Validate each record
    for (const record of marksData) {
      if (!record.studentId || !record.subject || !record.examType || 
          record.marks === undefined || !record.totalMarks || !record.semester) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields in marks record',
          invalidRecord: record
        });
      }
    }

    // For each marks record, update if exists or insert if new
    const operations = marksData.map(record => ({
      updateOne: {
        filter: {
          studentId: record.studentId,
          subject: record.subject,
          examType: record.examType,
          semester: record.semester
        },
        update: { $set: record },
        upsert: true
      }
    }));

    const result = await Mark.bulkWrite(operations);
    
    res.json({ 
      success: true, 
      message: 'Marks saved successfully',
      result
    });
  } catch (error) {
    console.error('Error saving marks:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving marks',
      error: error.message 
    });
  }
});

module.exports = router; 