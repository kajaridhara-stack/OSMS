const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/schoolManagement', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// Email Configuration (Configure with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like SendGrid, Outlook, etc.
  auth: {
     user: 'kajaridhara@gmail.com', // Your email
     pass: 'oipb lfou zjlj frbb' // App password (not your regular password)
  }
});

// ============= SCHEMAS =============

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

// Student Schema (includes login credentials)
const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  class: { type: String, required: true },
  rollNumber: { type: Number, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  dob: { type: Date, required: true },
  registrationDate: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

// Library Card Schema
const libraryCardSchema = new mongoose.Schema({
  cardNumber: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  class: { type: String, required: true },
  issueDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'suspended'], default: 'active' }
});

const LibraryCard = mongoose.model('LibraryCard', libraryCardSchema);

// Timetable Schema
const timetableSchema = new mongoose.Schema({
  class: { type: String, required: true },
  day: { type: String, required: true },
  period: { type: Number, required: true },
  subject: { type: String, required: true },
  teacher: { type: String, required: true },
  time: { type: String, required: true }
});

const Timetable = mongoose.model('Timetable', timetableSchema);

// Fee Structure Schema
const feeStructureSchema = new mongoose.Schema({
  class: { type: String, required: true, unique: true },
  tuitionFee: { type: Number, required: true },
  libraryFee: { type: Number, required: true },
  sportsFee: { type: Number, required: true },
  labFee: { type: Number, required: true },
  examFee: { type: Number, required: true },
  totalFee: { type: Number, required: true }
});

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);

// JWT Secret
const JWT_SECRET = 'school_management_secret_key_change_in_production';

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// ============= AUTH ROUTES =============

// Admin Sign Up
app.post('/api/auth/admin/signup', async (req, res) => {
  console.log('📝 Admin sign up request received');
  try {
    const { username, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      username,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin created:', username);

    const token = jwt.sign({ 
      id: admin._id, 
      username: admin.username, 
      role: admin.role 
    }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'Admin created successfully',
      token,
      user: { id: admin._id, username: admin.username, email: admin.email, role: admin.role }
    });
  } catch (error) {
    console.error('❌ Admin sign up error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin Sign In
app.post('/api/auth/admin/signin', async (req, res) => {
  console.log('🔐 Admin sign in request received');
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ 
      id: admin._id, 
      username: admin.username, 
      role: admin.role 
    }, JWT_SECRET, { expiresIn: '24h' });

    console.log('✅ Admin logged in:', admin.username);
    res.json({
      message: 'Login successful',
      token,
      user: { id: admin._id, username: admin.username, email: admin.email, role: admin.role }
    });
  } catch (error) {
    console.error('❌ Admin sign in error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student Sign In
app.post('/api/auth/student/signin', async (req, res) => {
  console.log('🔐 Student sign in request received');
  try {
    const { studentId, password } = req.body;

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ 
      id: student._id, 
      studentId: student.studentId,
      name: student.name,
      class: student.class,
      role: 'student' 
    }, JWT_SECRET, { expiresIn: '24h' });

    console.log('✅ Student logged in:', student.studentId);
    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: student._id, 
        studentId: student.studentId,
        name: student.name, 
        email: student.email, 
        class: student.class,
        role: 'student' 
      }
    });
  } catch (error) {
    console.error('❌ Student sign in error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============= STUDENT ROUTES =============

// Generate unique student ID
function generateStudentId(className, rollNumber) {
  const year = new Date().getFullYear();
  const classCode = className.replace(/\s+/g, '').toUpperCase();
  return `${year}${classCode}${String(rollNumber).padStart(3, '0')}`;
}

// Generate random password
function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Send email to student
async function sendStudentCredentials(email, studentId, password, name) {
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Welcome to School Management System - Your Login Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h2 style="color: #1e3c72;">Welcome to Our School Management System</h2>
          <p>Dear ${name},</p>
          <p>Your student account has been successfully created. Below are your login credentials:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Student ID:</strong> ${studentId}</p>
            <p style="margin: 10px 0;"><strong>Password:</strong> ${password}</p>
          </div>
          
          <p>Please keep these credentials safe and do not share them with anyone.</p>
          <p>You can now login to view your:</p>
          <ul>
            <li>Class Timetable</li>
            <li>Fee Structure</li>
            <li>Library Card</li>
          </ul>
          
          <p style="margin-top: 30px;">Best regards,<br>School Administration</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error);
    return false;
  }
}

// Register Student (Admin only)
app.post('/api/students', authenticateToken, isAdmin, async (req, res) => {
  console.log('👨‍🎓 Registering student');
  try {
    const { name, email, class: studentClass, rollNumber, address, phoneNumber, dob } = req.body;

    // Generate unique student ID
    const studentId = generateStudentId(studentClass, rollNumber);

    // Check if student with same roll number and class exists
    const existingStudent = await Student.findOne({ class: studentClass, rollNumber });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this roll number already exists in this class' });
    }

    // Generate password
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      studentId,
      password: hashedPassword,
      name,
      email,
      class: studentClass,
      rollNumber,
      address,
      phoneNumber,
      dob
    });

    await student.save();
    console.log('✅ Student registered:', studentId);

    // Send email with credentials
    const emailSent = await sendStudentCredentials(email, studentId, password, name);

    res.status(201).json({ 
      message: 'Student registered successfully', 
      student: {
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        class: student.class,
        rollNumber: student.rollNumber
      },
      emailSent
    });
  } catch (error) {
    console.error('❌ Error registering student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all students (Admin only)
app.get('/api/students', authenticateToken, isAdmin, async (req, res) => {
  console.log('📚 Fetching all students');
  try {
    const students = await Student.find().select('-password').sort({ class: 1, rollNumber: 1 });
    res.json(students);
  } catch (error) {
    console.error('❌ Error fetching students:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student by ID (Admin or own student)
app.get('/api/students/:id', authenticateToken, async (req, res) => {
  console.log('👤 Fetching student:', req.params.id);
  try {
    // Check if user is admin or the student themselves
    if (req.user.role !== 'admin' && req.user.studentId !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const student = await Student.findOne({ studentId: req.params.id }).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('❌ Error fetching student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============= LIBRARY CARD ROUTES =============

// Issue Library Card (Admin only)
app.post('/api/library/cards', authenticateToken, isAdmin, async (req, res) => {
  console.log('📚 Issuing library card');
  try {
    const { studentId } = req.body;

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if card already exists
    const existingCard = await LibraryCard.findOne({ studentId });
    if (existingCard) {
      return res.status(400).json({ message: 'Library card already issued to this student' });
    }

    const cardNumber = `LIB${Date.now()}`;
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const libraryCard = new LibraryCard({
      cardNumber,
      studentId: student.studentId,
      studentName: student.name,
      class: student.class,
      expiryDate
    });

    await libraryCard.save();
    console.log('✅ Library card issued:', cardNumber);
    res.status(201).json({ message: 'Library card issued successfully', libraryCard });
  } catch (error) {
    console.error('❌ Error issuing library card:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all library cards (Admin only)
app.get('/api/library/cards', authenticateToken, isAdmin, async (req, res) => {
  console.log('📖 Fetching all library cards');
  try {
    const cards = await LibraryCard.find().sort({ issueDate: -1 });
    res.json(cards);
  } catch (error) {
    console.error('❌ Error fetching library cards:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get library card by student ID (Admin or own student)
app.get('/api/library/cards/:studentId', authenticateToken, async (req, res) => {
  console.log('🔍 Fetching library card for student:', req.params.studentId);
  try {
    // Check if user is admin or the student themselves
    if (req.user.role !== 'admin' && req.user.studentId !== req.params.studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const card = await LibraryCard.findOne({ studentId: req.params.studentId });
    if (!card) {
      return res.status(404).json({ message: 'Library card not found' });
    }
    res.json(card);
  } catch (error) {
    console.error('❌ Error fetching library card:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============= TIMETABLE ROUTES =============

// Add timetable entry (Admin only)
app.post('/api/timetable', authenticateToken, isAdmin, async (req, res) => {
  console.log('📅 Adding timetable entry');
  try {
    const { class: className, day, period, subject, teacher, time } = req.body;

    const timetable = new Timetable({
      class: className,
      day,
      period,
      subject,
      teacher,
      time
    });

    await timetable.save();
    console.log('✅ Timetable entry added');
    res.status(201).json({ message: 'Timetable entry added successfully', timetable });
  } catch (error) {
    console.error('❌ Error adding timetable entry:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get timetable by class (Admin or student of that class)
app.get('/api/timetable/:class', authenticateToken, async (req, res) => {
  console.log('📋 Fetching timetable for class:', req.params.class);
  try {
    // Check if user is admin or student of the requested class
    if (req.user.role !== 'admin' && req.user.class !== req.params.class) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const timetable = await Timetable.find({ class: req.params.class })
      .sort({ day: 1, period: 1 });
    res.json(timetable);
  } catch (error) {
    console.error('❌ Error fetching timetable:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete timetable entry (Admin only)
app.delete('/api/timetable/:id', authenticateToken, isAdmin, async (req, res) => {
  console.log('🗑️ Deleting timetable entry:', req.params.id);
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    console.log('✅ Timetable entry deleted');
    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting timetable entry:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============= FEE STRUCTURE ROUTES =============

// Add/Update fee structure (Admin only)
app.post('/api/fees', authenticateToken, isAdmin, async (req, res) => {
  console.log('💰 Adding/Updating fee structure');
  try {
    const { class: className, tuitionFee, libraryFee, sportsFee, labFee, examFee } = req.body;

    const totalFee = tuitionFee + libraryFee + sportsFee + labFee + examFee;

    let feeStructure = await FeeStructure.findOne({ class: className });

    if (feeStructure) {
      // Update existing
      feeStructure.tuitionFee = tuitionFee;
      feeStructure.libraryFee = libraryFee;
      feeStructure.sportsFee = sportsFee;
      feeStructure.labFee = labFee;
      feeStructure.examFee = examFee;
      feeStructure.totalFee = totalFee;
      await feeStructure.save();
      console.log('✅ Fee structure updated');
      res.json({ message: 'Fee structure updated successfully', feeStructure });
    } else {
      // Create new
      feeStructure = new FeeStructure({
        class: className,
        tuitionFee,
        libraryFee,
        sportsFee,
        labFee,
        examFee,
        totalFee
      });
      await feeStructure.save();
      console.log('✅ Fee structure added');
      res.status(201).json({ message: 'Fee structure added successfully', feeStructure });
    }
  } catch (error) {
    console.error('❌ Error managing fee structure:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all fee structures (Admin only)
app.get('/api/fees', authenticateToken, isAdmin, async (req, res) => {
  console.log('💵 Fetching all fee structures');
  try {
    const fees = await FeeStructure.find().sort({ class: 1 });
    res.json(fees);
  } catch (error) {
    console.error('❌ Error fetching fee structures:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get fee structure by class (Admin or student of that class)
app.get('/api/fees/:class', authenticateToken, async (req, res) => {
  console.log('💳 Fetching fee structure for class:', req.params.class);
  try {
    // Check if user is admin or student of the requested class
    if (req.user.role !== 'admin' && req.user.class !== req.params.class) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const feeStructure = await FeeStructure.findOne({ class: req.params.class });
    if (!feeStructure) {
      return res.status(404).json({ message: 'Fee structure not found for this class' });
    }
    res.json(feeStructure);
  } catch (error) {
    console.error('❌ Error fetching fee structure:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'School Management System API is working!' });
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.path);
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log('=================================');
});