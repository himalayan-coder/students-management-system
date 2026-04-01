const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  username:  { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['admin', 'teacher'], default: 'teacher' },
  photo:     { type: String, default: '' },   // ← teacher photo
  createdAt: { type: Date, default: Date.now }
});

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
