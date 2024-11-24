require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const verifyTurnstileRouter = require('./api/verify-turnstile');
const authRouter = require('./api/auth');
const teacherRoutes = require('./routes/teacherRoutes');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/college_portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Keep all existing routes
app.use('/api/auth', authRouter);
app.use('/api', teacherRoutes);
app.use('/api', verifyTurnstileRouter);

// Add error logging middleware
app.use((req, res, next) => {
  console.log('Requested URL:', req.method, req.url);
  next();
});

// Add error handling
app.use((req, res) => {
  console.log('404 for path:', req.path);
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
