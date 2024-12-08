require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const verifyTurnstileRouter = require('./api/verify-turnstile');
const authRouter = require('./api/auth');
const teacherRoutes = require('./routes/teacherRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const feeRoutes = require('./routes/feeRoutes');
const examRoutes = require('./routes/examRoutes');
const markRoutes = require('./routes/markRoutes');
const teacherAttendanceRoutes = require('./routes/teacherAttendanceRoutes');
const teacherMarksRoutes = require('./routes/teacherMarksRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminTeacherRoutes = require('./routes/adminTeacherRoutes');
const profileImageRoutes = require('./routes/profileImage');
const http = require('http');
const socketIo = require('socket.io');

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Test routes
app.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Server is running' });
});

app.get('/api/test', (req, res) => {
  console.log('API test route hit');
  res.json({ message: 'API is working' });
});

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api', teacherRoutes);
app.use('/api', verifyTurnstileRouter);
app.use('/api', attendanceRoutes);
app.use('/api', feeRoutes);
app.use('/api', examRoutes);
app.use('/api', markRoutes);
app.use('/api', teacherAttendanceRoutes);
app.use('/api', teacherMarksRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', adminTeacherRoutes);
app.use('/api', profileImageRoutes);

// Error handling middleware
app.use((req, res) => {
  console.log('404 for path:', req.path);
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Track connected users
const connectedUsers = {
  students: new Set(),
  teachers: new Set(),
  admin: new Set()
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('userConnected', (data) => {
    const { userType, userId } = data;
    console.log('User connected:', { userType, userId }); // Debug log
    
    if (userType && userId) {
      socket.userId = userId; // Store userId in socket object
      connectedUsers[userType].add(userId);
      
      // Log current counts
      console.log('Current connected users:', {
        students: connectedUsers.students.size,
        teachers: connectedUsers.teachers.size,
        total: connectedUsers.students.size + connectedUsers.teachers.size
      });
      
      // Broadcast updated counts to all admin clients
      io.emit('activeUsers', {
        students: connectedUsers.students.size,
        teachers: connectedUsers.teachers.size,
        total: connectedUsers.students.size + connectedUsers.teachers.size
      });
    }
  });

  socket.on('disconnect', () => {
    // Remove user from tracking
    for (const [type, users] of Object.entries(connectedUsers)) {
      if (socket.userId && users.has(socket.userId)) {
        users.delete(socket.userId);
        console.log(`User disconnected from ${type}:`, socket.userId);
      }
    }

    // Log current counts
    console.log('Current connected users after disconnect:', {
      students: connectedUsers.students.size,
      teachers: connectedUsers.teachers.size,
      total: connectedUsers.students.size + connectedUsers.teachers.size
    });

    // Broadcast updated counts
    io.emit('activeUsers', {
      students: connectedUsers.students.size,
      teachers: connectedUsers.teachers.size,
      total: connectedUsers.students.size + connectedUsers.teachers.size
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Test the server at: http://localhost:${PORT}/test`);
  console.log(`Test the API at: http://localhost:${PORT}/api/test`);
});
