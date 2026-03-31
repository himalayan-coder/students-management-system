// authRoutes.js - Login, Register, Change Password, Session Timeout

const express = require('express');
const router  = express.Router();
const Teacher = require('../models/Teacher');

// ─── Seed default admin on first run ────────────────────────────────────────
const seedAdmin = async () => {
  const existing = await Teacher.findOne({ username: 'admin' });
  if (!existing) {
    await Teacher.create({
      name:     'Admin',
      username: 'admin',
      password: 'admin123',
      role:     'admin'
    });
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

    // Return teacher info (simple session — no JWT for beginner-friendliness)
    res.json({
      success:  true,
      name:     teacher.name,
      username: teacher.username,
      role:     teacher.role,
      id:       teacher._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// ─── POST /api/auth/register (admin only) ───────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, username, password, role } = req.body;

    // Check if username already exists
    const existing = await Teacher.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const newTeacher = await Teacher.create({ name, username, password, role: role || 'teacher' });
    res.status(201).json({ success: true, message: 'Teacher registered successfully', teacher: newTeacher });
  } catch (error) {
    res.status(500).json({ message: 'Error registering teacher', error });
  }
});

// ─── PUT /api/auth/change-password ──────────────────────────────────────────
router.put('/change-password', async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;

    const teacher = await Teacher.findOne({ username });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (teacher.password !== currentPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    teacher.password = newPassword;
    await teacher.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error });
  }
});

// ─── GET /api/auth/teachers (admin only — list all teachers) ────────────────
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await Teacher.find({}, { password: 0 }); // exclude password
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error });
  }
});

// ─── DELETE /api/auth/teachers/:id (admin only) ──────────────────────────────
router.delete('/teachers/:id', async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting teacher', error });
  }
});

module.exports = router;
