const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all students
router.get('/auth/admin/students', auth, async (req, res) => {
  try {
    const students = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 }); // Sort by creation date

    // Get new students count for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newStudentsThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Format the date in the response
    const formattedStudents = students.map(student => ({
      ...student.toObject(),
      createdAt: student.createdAt.toISOString()
    }));

    res.json({
      success: true,
      students: formattedStudents,
      newStudentsThisMonth
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students'
    });
  }
});

// Add new student
router.post('/auth/admin/students/register', auth, async (req, res) => {
  try {
    const { usn, name, department, year, section, password } = req.body;

    const existingStudent = await User.findOne({ usn });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'USN already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new User({
      usn,
      name,
      department,
      year,
      section,
      password: hashedPassword
    });

    await student.save();
    res.json({
      success: true,
      message: 'Student added successfully'
    });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding student'
    });
  }
});

// Update student
router.put('/auth/admin/students/update/:usn', auth, async (req, res) => {
  try {
    const { name, department, year, section, password } = req.body;
    const usn = req.params.usn;

    const student = await User.findOne({ usn });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update basic fields
    student.name = name;
    student.department = department;
    student.year = year;
    student.section = section;

    // Only update password if it's provided and not empty
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      student.password = hashedPassword;
    }

    await student.save();

    res.json({
      success: true,
      message: 'Student updated successfully'
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student'
    });
  }
});

// Delete student
router.delete('/auth/admin/students/delete/:usn', auth, async (req, res) => {
  try {
    const result = await User.findOneAndDelete({ usn: req.params.usn });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student'
    });
  }
});

module.exports = router; 