const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const examRoutes = require('./src/routes/examRoutes');
const feeRoutes = require('./src/routes/feeRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Register routes with proper prefixes
app.use('/api', examRoutes);
app.use('/api', feeRoutes);

mongoose.connect('mongodb://localhost:27017/college_portal')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

