const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  try {
    const admin = new Admin({
      name: 'Admin',
      username: 'admin',
      password: 'admin123' // In production, use hashed passwords
    });

    await admin.save();
    console.log('Admin created successfully');
  } catch (error) {
    console.error('Error creating admin:', error);
  }
  mongoose.connection.close();
})
.catch(err => console.error('MongoDB connection error:', err)); 