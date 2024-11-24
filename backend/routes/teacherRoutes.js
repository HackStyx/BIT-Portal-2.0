const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const authMiddleware = require('../middleware/auth');

// Get all teachers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const teachers = await Teacher.find({}, { password: 0 });
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
