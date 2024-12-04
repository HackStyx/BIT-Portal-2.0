const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');

// GET all fee records (for admin)
router.get('/fee/all', async (req, res) => {
  try {
    console.log('Fetching all fee records...');
    const feeRecords = await Fee.find().sort({ createdAt: -1 });
    console.log('Found fee records:', feeRecords);
    
    res.json({ 
      success: true, 
      feeRecords: feeRecords 
    });
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// GET fee records for a specific student
router.get('/fee/records', async (req, res) => {
  try {
    const { studentId } = req.query;
    console.log('Fetching fee records for student:', studentId);

    const feeRecords = await Fee.find({ studentId }).sort({ createdAt: -1 });
    console.log('Found fee records:', feeRecords);
    
    res.json({ 
      success: true, 
      feeRecords: feeRecords 
    });
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// POST new fee
router.post('/fee/create', async (req, res) => {
  try {
    console.log('Creating new fee record:', req.body);
    const fee = new Fee(req.body);
    await fee.save();
    res.json({ success: true, fee });
  } catch (error) {
    console.error('Error creating fee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update fee
router.put('/fee/update/:id', async (req, res) => {
  try {
    console.log('Updating fee record:', req.params.id);
    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }
    res.json({ success: true, fee });
  } catch (error) {
    console.error('Error updating fee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE fee
router.delete('/fee/delete/:id', async (req, res) => {
  try {
    console.log('Deleting fee record:', req.params.id);
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }
    res.json({ success: true, message: 'Fee record deleted successfully' });
  } catch (error) {
    console.error('Error deleting fee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 