const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// Debug route
router.get('/test-attendance', (req, res) => {
  console.log('Attendance test route hit');
  res.json({ message: 'Attendance routes are working' });
});

// Get attendance for a student
router.get('/attendance/:usn', async (req, res) => {
  console.log('Attendance route hit - USN:', req.params.usn);
  try {
    const { usn } = req.params;
    console.log('Fetching attendance for USN:', usn);

    const records = await Attendance.find({ usn });
    console.log('Found records:', records);

    if (!records || records.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No attendance records found for this USN'
      });
    }

    // Group by subject
    const subjectWise = {};
    records.forEach(record => {
      if (!subjectWise[record.subject]) {
        subjectWise[record.subject] = {
          totalClasses: 0,
          presentClasses: 0,
          records: []
        };
      }

      subjectWise[record.subject].totalClasses++;
      if (record.status === 'present') {
        subjectWise[record.subject].presentClasses++;
      }
      subjectWise[record.subject].records.push(record);
    });

    // Calculate percentages
    Object.keys(subjectWise).forEach(subject => {
      const { totalClasses, presentClasses } = subjectWise[subject];
      subjectWise[subject].percentage = ((presentClasses / totalClasses) * 100).toFixed(2);
    });

    const totalClasses = records.length;
    const totalPresent = records.filter(r => r.status === 'present').length;

    res.json({
      success: true,
      attendance: {
        overall: {
          totalClasses,
          presentClasses: totalPresent,
          absentClasses: totalClasses - totalPresent,
          percentage: ((totalPresent / totalClasses) * 100).toFixed(2)
        },
        subjectWise: subjectWise
      }
    });

  } catch (error) {
    console.error('Error in attendance route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;