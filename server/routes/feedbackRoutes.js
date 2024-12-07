const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const User = require('../models/User');

// Get feedback status for a student
router.get('/feedback/status/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const currentYear = new Date().getFullYear().toString();
    
    // Find all feedback submitted by the student in current year
    const submittedFeedback = await Feedback.find({
      studentId,
      academicYear: currentYear
    }).select('subject');

    // Create a map of submitted subjects
    const submittedSubjects = submittedFeedback.map(f => f.subject);

    res.json({
      success: true,
      submittedSubjects
    });
  } catch (error) {
    console.error('Error fetching feedback status:', error);
    res.status(500).json({ success: false, message: 'Error fetching feedback status' });
  }
});

// Submit feedback
router.post('/feedback/submit', async (req, res) => {
  try {
    const { studentId, subject, faculty, responses, semester } = req.body;

    // Debug log
    console.log('Received feedback submission:', {
      studentId,
      subject,
      faculty,
      responses,
      semester
    });

    // Validate required fields
    if (!studentId || !subject || !faculty || !responses || !semester) {
      console.log('Missing required fields:', { studentId, subject, faculty, responses, semester });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate responses
    if (!Array.isArray(responses) || responses.length === 0) {
      console.log('Invalid responses format:', responses);
      return res.status(400).json({
        success: false,
        message: 'Invalid responses format'
      });
    }

    // Create new feedback
    const feedback = new Feedback({
      studentId,
      subject,
      faculty,
      responses,
      semester,
      academicYear: new Date().getFullYear().toString()
    });

    // Debug log before saving
    console.log('Attempting to save feedback:', feedback);

    await feedback.save();

    // Debug log after successful save
    console.log('Feedback saved successfully');

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error in feedback submission:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Feedback already submitted for this subject'
      });
    }

    // Log the full error details
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
});

// Get subjects for feedback
router.get('/feedback/subjects/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // You'll need to adjust this query based on your database structure
    // This is just an example
    const student = await User.findOne({ usn: studentId });
    
    // Fetch subjects based on student's semester/section
    const subjects = [
      {
        section: student.section,
        code: 'CS101',
        name: 'Data Structures and Algorithms',
        faculty: 'Dr. John Doe'
      },
      {
        section: student.section,
        code: 'CS102',
        name: 'Database Management Systems',
        faculty: 'Prof. Jane Smith'
      },
      // Add more subjects
    ];

    res.json({
      success: true,
      subjects
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ success: false, message: 'Error fetching subjects' });
  }
});

module.exports = router; 