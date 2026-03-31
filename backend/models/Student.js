// Student.js - MongoDB model with extended profile fields

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Basic Info
  name:        { type: String, required: true },
  rollNumber:  { type: String, required: true, unique: true },
  email:       { type: String, required: true },
  course:      { type: String, required: true },

  // Extended Profile (Level 2)
  dateOfBirth: { type: String, required: true },   // stored as YYYY-MM-DD
  gender:      { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  phone:       { type: String, required: true },
  address:     { type: String, default: '' },

  // Guardian Info
  guardianName:  { type: String, default: '' },
  guardianPhone: { type: String, default: '' },

  // Photo
  photo:       { type: String, default: '' },       // filename of uploaded photo

  // Timestamps
  createdAt:   { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
