const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyTurnstileToken } = require('./verify-turnstile');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const authMiddleware = require('../middleware/auth');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/login', async (req, res) => {
  try {
    const { usn, password, captchaToken } = req.body;
    console.log('Login attempt for USN:', usn);
    console.log('Received captcha token:', captchaToken);

    // Verify turnstile token first
    const turnstileVerified = await verifyTurnstileToken(captchaToken);
    if (!turnstileVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Turnstile verification failed. Please try again.' 
      });
    }

    // Find user by USN
    const user = await User.findOne({ usn });
    if (!user) {
      console.log('User not found:', usn);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, usn: user.usn },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Login successful for USN:', usn);
    res.json({
      success: true,
      token,
      user: {
        usn: user.usn,
        id: user._id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add this route to get all students
router.get('/students', async (req, res) => {
  try {
    console.log('Received request for students');
    const students = await User.find({}, { password: 0 });
    console.log('Found students:', students);
    res.json({ success: true, students });
  } catch (error) {
    console.error('Server error while fetching students:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/admin/register', async (req, res) => {
  try {
    const { usn, name, department, year, section, password } = req.body;

    const existingUser = await User.findOne({ usn });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'USN already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      usn,
      name,
      department,
      year,
      section,
      password: hashedPassword,
    });

    await user.save();
    res.json({ success: true, message: 'Student registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete student route
router.delete('/admin/delete/:usn', async (req, res) => {
  try {
    const { usn } = req.params;
    const result = await User.findOneAndDelete({ usn });
    if (result) {
      res.json({ success: true, message: 'Student deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Student not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update student route
router.put('/admin/update/:usn', async (req, res) => {
  try {
    const { usn } = req.params;
    const updates = req.body;
    
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    } else {
      delete updates.password;
    }

    const result = await User.findOneAndUpdate(
      { usn },
      updates,
      { new: true }
    );

    if (result) {
      res.json({ success: true, message: 'Student updated successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Student not found' });
    }
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student details
router.get('/student/:usn', async (req, res) => {
  try {
    const student = await User.findOne({ usn: req.params.usn });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Send all student data
    res.json({
      success: true,
      student: {
        name: student.name,
        usn: student.usn,
        email: student.email,
        department: student.department,
        section: student.section,
        year: student.year,
        semester: student.year * 2, // Calculate semester from year (1st year = sem 1,2; 2nd year = sem 3,4, etc.)
        phone: student.phone,
        // Add any other fields you have in your User model
      }
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ success: false, message: 'Error fetching student data' });
  }
});

// Add this route for logout
router.post('/logout', async (req, res) => {
  try {
    // In a real application, you might want to invalidate the token on the server
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Teacher routes
router.post('/teacher/login', async (req, res) => {
  try {
    const { teacherId, password } = req.body;
    const teacher = await Teacher.findOne({ teacherId });
    
    if (!teacher) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: teacher._id,
        teacherId: teacher.teacherId,
        role: 'teacher',
        name: teacher.name,
        department: teacher.department
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      teacher: {
        teacherId: teacher.teacherId,
        name: teacher.name,
        department: teacher.department,
        designation: teacher.designation,
        email: teacher.email
      }
    });
  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get teacher data
router.get('/teacher/data/:teacherId', authMiddleware, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const teacher = await Teacher.findOne({ teacherId }, { password: 0 });
    
    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }

    res.json({ 
      success: true, 
      teacher: {
        teacherId: teacher.teacherId,
        name: teacher.name,
        department: teacher.department,
        designation: teacher.designation,
        email: teacher.email,
        subjects: teacher.subjects
      }
    });
  } catch (error) {
    console.error('Error fetching teacher data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add this route to get all teachers
router.get('/auth/admin/getAllTeachers', authMiddleware, async (req, res) => {
  try {
    const teachers = await Teacher.find({}).sort({ createdAt: -1 });
    res.json({ success: true, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/auth/admin/getRecentTeachers', authMiddleware, async (req, res) => {
  try {
    const teachers = await Teacher.find({})
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ success: true, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin login route
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Log the request
    console.log('Admin login attempt:', { username });

    // Find admin by username
    const admin = await Admin.findOne({ username });
    
    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Verify password (assuming you're storing hashed passwords)
    const isValidPassword = password === admin.password; // Replace with proper password comparison
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send success response
    res.json({
      success: true,
      token,
      admin: {
        name: admin.name,
        username: admin.username
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Add this route handler for updating profile picture
router.put('/update-profile-picture', async (req, res) => {
  try {
    const { usn, profilePicture } = req.body;
    
    const updatedUser = await User.findOneAndUpdate(
      { usn },
      { profilePicture },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    res.json({ 
      success: true, 
      user: updatedUser,
      message: 'Profile picture updated successfully' 
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating profile picture' 
    });
  }
});

module.exports = router;
