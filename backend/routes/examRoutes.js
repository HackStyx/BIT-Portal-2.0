const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');

// GET all exams
router.get('/exam/all', async (req, res) => {
  try {
    const exams = await Exam.find().sort({ date: 1 });
    res.json({
      success: true,
      exams
    });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// CREATE new exam
router.post('/exam', async (req, res) => {
  try {
    const newExam = new Exam(req.body);
    const savedExam = await newExam.save();
    res.json({
      success: true,
      exam: savedExam,
      message: 'Exam created successfully'
    });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// UPDATE exam
router.put('/exam/:id', async (req, res) => {
  try {
    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedExam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }
    res.json({
      success: true,
      exam: updatedExam,
      message: 'Exam updated successfully'
    });
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE exam
router.delete('/exam/:id', async (req, res) => {
  try {
    const deletedExam = await Exam.findByIdAndDelete(req.params.id);
    if (!deletedExam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }
    res.json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET exams for a specific department and semester
router.get('/exam/schedule', async (req, res) => {
  try {
    const { department, semester } = req.query;
    const exams = await Exam.find({ 
      department, 
      semester 
    }).sort({ date: 1 });
    
    res.json({
      success: true,
      exams
    });
  } catch (error) {
    console.error('Error fetching exam schedule:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET single exam by ID
router.get('/exam/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }
    res.json({
      success: true,
      exam
    });
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;