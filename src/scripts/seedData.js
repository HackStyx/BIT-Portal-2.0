const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/college_portal');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Define schemas directly in the seed file to avoid model conflicts
const examSchema = new mongoose.Schema({
  examName: { type: String, required: true },
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  duration: { type: String, required: true },
  totalMarks: { type: String, required: true },
  department: { type: String, required: true },
  semester: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const feeSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  semester: { type: String, required: true },
  academicYear: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const seedData = async () => {
  try {
    // Create models without checking if they exist
    const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
    const Fee = mongoose.models.Fee || mongoose.model('Fee', feeSchema);

    // Clear existing data
    await Exam.deleteMany({});
    await Fee.deleteMany({});

    // Sample Exam data
    const examData = [
      {
        examName: 'Mid Semester Examination',
        subject: 'Data Structures',
        date: '2024-04-15',
        startTime: '10:00',
        duration: '180',
        totalMarks: '100',
        department: 'Computer Science',
        semester: '3rd'
      },
      {
        examName: 'Final Examination',
        subject: 'Database Management',
        date: '2024-05-20',
        startTime: '14:00',
        duration: '180',
        totalMarks: '100',
        department: 'Information Technology',
        semester: '4th'
      }
    ];

    // Sample Fee data
    const feeData = [
      {
        studentId: '2024CS001',
        amount: 45000,
        dueDate: '2024-03-31',
        status: 'pending',
        semester: '3rd',
        academicYear: '2023-24'
      },
      {
        studentId: '2024IT002',
        amount: 45000,
        dueDate: '2024-03-31',
        status: 'paid',
        semester: '4th',
        academicYear: '2023-24'
      }
    ];

    await Exam.insertMany(examData);
    await Fee.insertMany(feeData);

    console.log('Sample data inserted successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

connectDB().then(() => {
  seedData();
}); 