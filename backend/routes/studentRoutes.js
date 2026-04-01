const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const Student  = require('../models/Student');

// ─── Multer setup ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/jpeg|jpg|png|gif/.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files allowed!'));
  }
});

// ─── GET all students ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ course: 1, rollNumber: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error });
  }
});

// ─── GET next roll number for a course ───────────────────────────────────────
router.get('/next-roll/:course', async (req, res) => {
  try {
    const course   = decodeURIComponent(req.params.course);
    // Find all students in this course, sort by rollNumber numerically
    const students = await Student.find({ course }).sort({ rollNumber: 1 });

    if (students.length === 0) {
      return res.json({ nextRoll: '1' }); // First student in course
    }

    // Get the highest roll number in this course
    const rolls   = students.map((s) => parseInt(s.rollNumber)).filter((n) => !isNaN(n));
    const maxRoll = rolls.length > 0 ? Math.max(...rolls) : 0;
    res.json({ nextRoll: String(maxRoll + 1) });
  } catch (error) {
    res.status(500).json({ message: 'Error getting next roll number', error });
  }
});

// ─── GET all unique courses ───────────────────────────────────────────────────
router.get('/courses', async (req, res) => {
  try {
    const courses = await Student.distinct('course');
    res.json(courses.sort());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error });
  }
});

// ─── GET single student ───────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student', error });
  }
});

// ─── POST add student ─────────────────────────────────────────────────────────
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.photo = req.file.filename;

    // Check if rollNumber already exists in this course
    const existing = await Student.findOne({ rollNumber: data.rollNumber, course: data.course });
    if (existing) {
      return res.status(400).json({ message: `Roll number ${data.rollNumber} already exists in ${data.course}` });
    }

    const newStudent = new Student(data);
    const saved      = await newStudent.save();
    res.status(201).json(saved);
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return res.status(400).json({ message: 'Email already registered. Use a different email.' });
      }
      return res.status(400).json({ message: 'Roll number already exists in this course.' });
    }
    res.status(400).json({ message: 'Error adding student', error });
  }
});

// ─── PUT update student ───────────────────────────────────────────────────────
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.photo = req.file.filename;

    const updated = await Student.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ message: 'Student not found' });
    res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return res.status(400).json({ message: 'Email already registered.' });
      }
      return res.status(400).json({ message: 'Roll number already exists in this course.' });
    }
    res.status(400).json({ message: 'Error updating student', error });
  }
});

// ─── DELETE student ───────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student', error });
  }
});

module.exports = router;
