// GET /api/fee/records
router.get('/records', async (req, res) => {
  try {
    const { studentId } = req.query;
    console.log('Fetching fee records for student:', studentId);

    // Add filter to only get records for the specific studentId
    const feeRecords = await Fee.findOne({ studentId: studentId });
    const student = await Student.findOne({ usn: studentId });

    console.log('Found fee records:', feeRecords);

    res.json({
      success: true,
      feeRecords: feeRecords,
      student: student
    });
  } catch (error) {
    console.error('Error fetching fee records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fee records'
    });
  }
}); 