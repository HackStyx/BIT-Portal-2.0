require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const examRoutes = require('./routes/examRoutes');
const feeRoutes = require('./routes/feeRoutes');
const authRoutes = require('../server/api/auth');
const verifyTurnstileRouter = require('../server/api/verify-turnstile');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Register all routes
app.use('/api', verifyTurnstileRouter);
app.use('/api', examRoutes);
app.use('/api', feeRoutes);
app.use('/api/auth', authRoutes);

// Error handling
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something broke!' });
});

mongoose.connect('mongodb://localhost:27017/college_portal')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
