const mongoose = require('mongoose');
require('dotenv').config();

// Update the path to match your project structure
const Attendance = require('../src/models/Attendance');

// Connect to MongoDB
mongoose.connect(`mongodb://localhost:27017/college_portal`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

// Sample attendance data
const attendanceData = [
  {
    usn: "1BI21CS001",
    year: "2",
    section: "B",
    subject: "Software Engineering",
    date: new Date("2024-03-10"),
    status: "present"
  },
  {
    usn: "1BI21CS001",
    year: "2",
    section: "B",
    subject: "Computer Networks",
    date: new Date("2024-03-10"),
    status: "absent"
  },
  {
    usn: "1BI21CS001",
    year: "2",
    section: "B",
    subject: "Theory of Computation",
    date: new Date("2024-03-10"),
    status: "present"
  }
];

// Function to seed the database
async function seedAttendance() {
  try {
    // Clear existing records (optional)
    await Attendance.deleteMany({});
    console.log('Cleared existing attendance records');

    // Insert new records
    const result = await Attendance.insertMany(attendanceData);
    console.log(`Successfully inserted ${result.length} attendance records`);

  } catch (error) {
    console.error('Error seeding attendance data:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
seedAttendance(); 