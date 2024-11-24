const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const teacherRoutes = require('./routes/teacherRoutes');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // Your React app's URL
  credentials: true
}));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);

// ... rest of your server code
