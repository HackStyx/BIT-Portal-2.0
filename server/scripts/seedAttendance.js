const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');

mongoose.connect('mongodb://localhost:27017/college_portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB')).catch(err => console.error(err));

const attendanceData = [
  {
    usn: "1BI22CS100",
    year: "2",
    section: "B",
    subject: "Software Engineering",
    date: new Date("2024-03-10"),
    status: "present"
  },
  {
    usn: "1BI22CS100",
    year: "2",
    section: "B",
    subject: "Software Engineering",
    date: new Date("2024-03-11"),
    status: "present"
  },
  {
    usn: "1BI22CS100",
    year: "2",
    section: "B",
    subject: "Computer Networks",
    date: new Date("2024-03-10"),
    status: "absent"
  },
  {
    usn: "1BI22CS100",
    year: "2",
    section: "B",
    subject: "Computer Networks",
    date: new Date("2024-03-11"),
    status: "present"
  }
];

async function seedData() {
  try {
    // Clear existing records
    await Attendance.deleteMany({});
    console.log('Cleared existing attendance records');

    // Insert new records
    const result = await Attendance.insertMany(attendanceData);
    console.log(`Inserted ${result.length} attendance records`);
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedData();
