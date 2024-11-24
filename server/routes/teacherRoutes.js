const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const authMiddleware = require('../middleware/auth');

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

module.exports = router;
