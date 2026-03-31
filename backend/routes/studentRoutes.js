// studentRoutes.js - CRUD with photo upload

const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const Student  = require('../models/Student');

// ─── Multer setup for photo uploads ─────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files are allowed!'));
  }
});

// ─── GET all students ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error });
  }
});

// ─── GET single student ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student', error });
  }
});

// ─── POST add student (with optional photo) ──────────────────────────────────
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.photo = req.file.filename;

    const newStudent = new Student(data);
    const saved      = await newStudent.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Error adding student', error });
  }
});

// ─── PUT update student (with optional new photo) ────────────────────────────
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.photo = req.file.filename;

    const updated = await Student.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ message: 'Student not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating student', error });
  }
});

// ─── DELETE student ──────────────────────────────────────────────────────────
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
