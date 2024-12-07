require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const verifyTurnstileRouter = require('./api/verify-turnstile');
const authRouter = require('./api/auth');
const teacherRoutes = require('./routes/teacherRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const feeRoutes = require('./routes/feeRoutes');
const examRoutes = require('./routes/examRoutes');
const markRoutes = require('./routes/markRoutes');
const teacherAttendanceRoutes = require('./routes/teacherAttendanceRoutes');
const teacherMarksRoutes = require('./routes/teacherMarksRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminTeacherRoutes = require('./routes/adminTeacherRoutes');

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Test routes
app.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Server is running' });
});

app.get('/api/test', (req, res) => {
  console.log('API test route hit');
  res.json({ message: 'API is working' });
});

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api', teacherRoutes);
app.use('/api', verifyTurnstileRouter);
app.use('/api', attendanceRoutes);
app.use('/api', feeRoutes);
app.use('/api', examRoutes);
app.use('/api', markRoutes);
app.use('/api', teacherAttendanceRoutes);
app.use('/api', teacherMarksRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', adminTeacherRoutes);

// Error handling middleware
app.use((req, res) => {
  console.log('404 for path:', req.path);
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Test the server at: http://localhost:${PORT}/test`);
  console.log(`Test the API at: http://localhost:${PORT}/api/test`);
});
