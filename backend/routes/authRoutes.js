const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const Teacher = require('../models/Teacher');

// ─── Multer for teacher photo uploads ───────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'teacher-' + unique + path.extname(file.originalname));
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

// ─── Seed default admin ──────────────────────────────────────────────────────
const seedAdmin = async () => {
  const existing = await Teacher.findOne({ username: 'admin' });
  if (!existing) {
    await Teacher.create({ name: 'Admin', username: 'admin', password: 'admin123', role: 'admin' });
    console.log('Default admin created: admin / admin123');
  }
};
seedAdmin();

// ─── POST /api/auth/login ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const teacher = await Teacher.findOne({ username });
    if (!teacher || teacher.password !== password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    res.json({ success: true, name: teacher.name, username: teacher.username, role: teacher.role, id: teacher._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// ─── POST /api/auth/register (with optional photo) ──────────────────────────
router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    const existing = await Teacher.findOne({ username });
    if (existing) return res.status(400).json({ message: 'Username already exists' });

    const data = { name, username, password, role: role || 'teacher' };
    if (req.file) data.photo = req.file.filename;

    const newTeacher = await Teacher.create(data);
    res.status(201).json({ success: true, message: 'Teacher registered successfully', teacher: newTeacher });
  } catch (error) {
    res.status(500).json({ message: 'Error registering teacher', error });
  }
});

// ─── PUT /api/auth/teachers/:id (edit teacher) ──────────────────────────────
router.put('/teachers/:id', upload.single('photo'), async (req, res) => {
  try {
    const { name, username, role, password } = req.body;
    const updateData = { name, username, role };
    if (password && password.trim() !== '') updateData.password = password;
    if (req.file) updateData.photo = req.file.filename;

    const updated = await Teacher.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ success: true, message: 'Teacher updated successfully', teacher: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating teacher', error });
  }
});

// ─── PUT /api/auth/change-password ──────────────────────────────────────────
router.put('/change-password', async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    const teacher = await Teacher.findOne({ username });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    if (teacher.password !== currentPassword) return res.status(401).json({ message: 'Current password is incorrect' });
    teacher.password = newPassword;
    await teacher.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error });
  }
});

// ─── GET /api/auth/teachers ──────────────────────────────────────────────────
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await Teacher.find({}, { password: 0 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error });
  }
});

// ─── GET /api/auth/teachers/:id ─────────────────────────────────────────────
router.get('/teachers/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id, { password: 0 });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher', error });
  }
});

// ─── DELETE /api/auth/teachers/:id ──────────────────────────────────────────
router.delete('/teachers/:id', async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting teacher', error });
  }
});

module.exports = router;
