const mongoose = require('mongoose');
const Mark = require('../models/Mark');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college_portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB')).catch(err => console.error(err));

const marksData = [
  // 3rd Semester Marks
  {
    studentId: "1BI22CS100",
    subject: "Data Structures and Algorithms",
    examType: "Internal Assessment 1",
    marks: 45,
    totalMarks: 50,
    semester: "3",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Data Structures and Algorithms",
    examType: "Internal Assessment 2",
    marks: 42,
    totalMarks: 50,
    semester: "3",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Object Oriented Programming",
    examType: "Internal Assessment 1",
    marks: 48,
    totalMarks: 50,
    semester: "3",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Object Oriented Programming",
    examType: "Internal Assessment 2",
    marks: 44,
    totalMarks: 50,
    semester: "3",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Database Management Systems",
    examType: "Internal Assessment 1",
    marks: 43,
    totalMarks: 50,
    semester: "3",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Database Management Systems",
    examType: "Internal Assessment 2",
    marks: 46,
    totalMarks: 50,
    semester: "3",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Computer Networks",
    examType: "Internal Assessment 1",
    marks: 40,
    totalMarks: 50,
    semester: "3",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Computer Networks",
    examType: "Internal Assessment 2",
    marks: 44,
    totalMarks: 50,
    semester: "3",
    academicYear: "2023-24"
  },

  // 4th Semester Marks
  {
    studentId: "1BI22CS100",
    subject: "Operating Systems",
    examType: "Internal Assessment 1",
    marks: 47,
    totalMarks: 50,
    semester: "4",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Operating Systems",
    examType: "Internal Assessment 2",
    marks: 45,
    totalMarks: 50,
    semester: "4",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Software Engineering",
    examType: "Internal Assessment 1",
    marks: 44,
    totalMarks: 50,
    semester: "4",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Software Engineering",
    examType: "Internal Assessment 2",
    marks: 46,
    totalMarks: 50,
    semester: "4",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Web Technologies",
    examType: "Internal Assessment 1",
    marks: 48,
    totalMarks: 50,
    semester: "4",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Web Technologies",
    examType: "Internal Assessment 2",
    marks: 49,
    totalMarks: 50,
    semester: "4",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Artificial Intelligence",
    examType: "Internal Assessment 1",
    marks: 42,
    totalMarks: 50,
    semester: "4",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Artificial Intelligence",
    examType: "Internal Assessment 2",
    marks: 45,
    totalMarks: 50,
    semester: "4",
    academicYear: "2023-24"
  },

  // Add Internal Assessment 3 for all subjects
  {
    studentId: "1BI22CS100",
    subject: "Data Structures and Algorithms",
    examType: "Internal Assessment 3",
    marks: 47,
    totalMarks: 50,
    semester: "3",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Object Oriented Programming",
    examType: "Internal Assessment 3",
    marks: 46,
    totalMarks: 50,
    semester: "3",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Database Management Systems",
    examType: "Internal Assessment 3",
    marks: 48,
    totalMarks: 50,
    semester: "3",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Computer Networks",
    examType: "Internal Assessment 3",
    marks: 45,
    totalMarks: 50,
    semester: "3",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Operating Systems",
    examType: "Internal Assessment 3",
    marks: 46,
    totalMarks: 50,
    semester: "4",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Software Engineering",
    examType: "Internal Assessment 3",
    marks: 47,
    totalMarks: 50,
    semester: "4",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Web Technologies",
    examType: "Internal Assessment 3",
    marks: 48,
    totalMarks: 50,
    semester: "4",
    academicYear: "2023-24"
  },
  {
    studentId: "1BI22CS100",
    subject: "Artificial Intelligence",
    examType: "Internal Assessment 3",
    marks: 44,
    totalMarks: 50,
    semester: "4",
    academicYear: "2023-24"
  }
];

async function seedMarks() {
  try {
    await Mark.deleteMany({});
    console.log('Cleared existing marks records');

    const result = await Mark.insertMany(marksData);
    console.log(`Inserted ${result.length} marks records`);
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedMarks(); 