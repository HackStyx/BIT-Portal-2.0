const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/college_portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('test123', 10);
    const user = new User({
      usn: '1MS21CS001',
      name: 'Test Student',
      department: 'CSE',
      year: '2021',
      section: 'A',
      password: hashedPassword,
    });
    await user.save();
    console.log('Test user created successfully');
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    mongoose.disconnect();
  }
}

createTestUser();
