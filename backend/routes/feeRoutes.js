const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const Student = require('../models/Student');

// GET fee records for a specific student
router.get('/fee/records', async (req, res) => {
  try {
    const { studentId } = req.query;
    console.log('Fetching fee records for student:', studentId);

    const feeRecords = await Fee.find({ studentId }).sort({ createdAt: -1 });
    console.log('Found fee records:', feeRecords);

    // Calculate totals
    const total = feeRecords.reduce((sum, fee) => sum + fee.amount, 0);
    const paid = feeRecords.reduce((sum, fee) => 
      fee.status === 'paid' ? sum + fee.amount : sum, 0);
    const pending = total - paid;

    res.json({
      success: true,
      feeRecords,
      summary: {
        total,
        paid,
        pending
      }
    });
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 