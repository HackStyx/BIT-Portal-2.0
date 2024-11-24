const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');

// GET all exams
router.get('/exams', async (req, res) => {
  try {
    console.log('Fetching exams from database...');
    const exams = await Exam.find().sort({ date: 1 });
    console.log('Found exams:', exams);
    res.json({ success: true, exams });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new exam
router.post('/exams', async (req, res) => {
  try {
    console.log('Creating new exam:', req.body);
    const exam = new Exam(req.body);
    await exam.save();
    res.json({ success: true, exam });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update exam
router.put('/exams/:id', async (req, res) => {
  try {
    console.log('Updating exam:', req.params.id);
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }
    res.json({ success: true, exam });
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete exam
router.delete('/exams/:id', async (req, res) => {
  try {
    console.log('Deleting exam:', req.params.id);
    const exam = await Exam.findByIdAndDelete(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }
    
    res.json({ success: true, message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;