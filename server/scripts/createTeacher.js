require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher');

mongoose.connect('mongodb://localhost:27017/college_portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createInitialTeacher() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const teacher = new Teacher({
      teacherId: 'TECH003',
      name: 'Madhuri J',
      email: 'madhuri.j@college.edu',
      department: 'Computer Science and Engineering',
      designation: 'Assistant Professor',
      password: hashedPassword,
      subjects: ['Data Structures', 'Algorithms', 'Database Management'],
    });

    await teacher.save();
    console.log('Initial teacher account created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating teacher account:', error);
    process.exit(1);
  }
}

createInitialTeacher();
