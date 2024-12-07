const mongoose = require('mongoose');
const TeacherAttendance = require('../server/models/TeacherAttendance');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function seedAttendanceData() {
  try {
    // Clear existing attendance data
    await TeacherAttendance.deleteMany({});

    // Use the existing teacher's ID
    const teacherId = "6722270fbf658f35893ce306"; // Your existing teacher's _id

    // Create attendance records for the last 30 days
    const attendanceRecords = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Randomize check-in time between 8:45 and 9:15
      const checkInHour = 8 + (Math.random() < 0.8 ? 0 : 1); // 80% chance of being before 9
      const checkInMinute = Math.floor(Math.random() * 60);
      const checkIn = `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')}`;
      
      // Randomize check-out time between 16:45 and 17:15
      const checkOutHour = 16 + (Math.random() < 0.8 ? 1 : 0); // 80% chance of being after 5
      const checkOutMinute = Math.floor(Math.random() * 60);
      const checkOut = `${checkOutHour.toString().padStart(2, '0')}:${checkOutMinute.toString().padStart(2, '0')}`;
      
      // Calculate working hours (roughly)
      const workingHours = (checkOutHour + checkOutMinute/60) - (checkInHour + checkInMinute/60);
      
      // Determine status based on check-in time
      let status = 'present';
      if (checkInHour >= 9 && checkInMinute > 15) {
        status = 'late';
      } else if (Math.random() < 0.1) { // 10% chance of being absent
        status = 'absent';
      }

      attendanceRecords.push({
        teacherId: teacherId,
        date: date,
        checkIn: status === 'absent' ? null : checkIn,
        checkOut: status === 'absent' ? null : checkOut,
        status: status,
        workingHours: status === 'absent' ? 0 : parseFloat(workingHours.toFixed(2)),
        breakTime: status === 'absent' ? 0 : parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)) // Random break time between 0.5 and 1 hour
      });
    }

    await TeacherAttendance.insertMany(attendanceRecords);
    console.log('Sample attendance data seeded successfully');
  } catch (error) {
    console.error('Error seeding attendance data:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedAttendanceData();