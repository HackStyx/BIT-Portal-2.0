const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');

// Get all teachers (Admin)
router.get('/auth/admin/teachers', auth, async (req, res) => {
  try {
    const teachers = await Teacher.find({})
      .select('-password')
      .sort({ name: 1 });

    res.json({
      success: true,
      teachers
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teachers'
    });
  }
});

// Add new teacher (Admin)
router.post('/auth/admin/teachers/register', auth, async (req, res) => {
  try {
    const { teacherId, name, email, password, department, designation, subjects } = req.body;

    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as admin'
      });
    }

    const existingTeacher = await Teacher.findOne({ 
      $or: [{ teacherId }, { email }] 
    });

    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: 'Teacher with this ID or email already exists'
      });
    }

    const teacher = new Teacher({
      teacherId,
      name,
      email,
      password, // Note: In production, hash the password
      department,
      designation,
      subjects: subjects || []
    });

    await teacher.save();

    res.json({
      success: true,
      message: 'Teacher registered successfully'
    });
  } catch (error) {
    console.error('Error registering teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering teacher'
    });
  }
});

// Update teacher (Admin)
router.put('/auth/admin/teachers/update/:teacherId', auth, async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as admin'
      });
    }

    const { name, email, department, designation, subjects, password } = req.body;
    const teacherId = req.params.teacherId;

    const teacher = await Teacher.findOne({ teacherId });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Update basic fields
    teacher.name = name;
    teacher.email = email;
    teacher.department = department;
    teacher.designation = designation;
    teacher.subjects = subjects || [];

    // Only update password if it's provided and not empty
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      teacher.password = hashedPassword;
    }

    await teacher.save();

    res.json({
      success: true,
      message: 'Teacher updated successfully'
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating teacher'
    });
  }
});

// Delete teacher (Admin)
router.delete('/auth/admin/teachers/delete/:teacherId', auth, async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as admin'
      });
    }

    const teacherId = req.params.teacherId;
    const result = await Teacher.findOneAndDelete({ teacherId });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting teacher'
    });
  }
});

module.exports = router; 