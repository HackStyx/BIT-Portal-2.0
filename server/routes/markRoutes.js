const express = require('express');
const router = express.Router();
const Mark = require('../models/Mark');
const Student = require('../models/User');

// GET marks for a specific student
router.get('/marks/:usn', async (req, res) => {
  try {
    const { usn } = req.params;
    console.log('Fetching marks for USN:', usn);

    const marks = await Mark.find({ studentId: usn }).sort({ 
      semester: 1,
      subject: 1,
      examType: 1 
    });
    
    const student = await Student.findOne({ usn });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (!marks || marks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No marks found for this USN'
      });
    }

    // Group marks by semester and subject
    const groupedMarks = marks.reduce((acc, mark) => {
      if (!acc[mark.semester]) {
        acc[mark.semester] = {};
      }
      if (!acc[mark.semester][mark.subject]) {
        acc[mark.semester][mark.subject] = [];
      }
      acc[mark.semester][mark.subject].push(mark);
      return acc;
    }, {});

    // Calculate averages and totals
    const summary = {};
    Object.keys(groupedMarks).forEach(semester => {
      summary[semester] = {
        totalMarks: 0,
        obtainedMarks: 0,
        subjects: 0
      };
      
      Object.keys(groupedMarks[semester]).forEach(subject => {
        const subjectMarks = groupedMarks[semester][subject];
        const total = subjectMarks.reduce((sum, mark) => sum + mark.marks, 0);
        const possible = subjectMarks.reduce((sum, mark) => sum + mark.totalMarks, 0);
        
        summary[semester].totalMarks += possible;
        summary[semester].obtainedMarks += total;
        summary[semester].subjects += 1;
      });
      
      summary[semester].percentage = (
        (summary[semester].obtainedMarks / summary[semester].totalMarks) * 100
      ).toFixed(2);
    });

    res.json({
      success: true,
      student,
      marks: groupedMarks,
      summary
    });

  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 