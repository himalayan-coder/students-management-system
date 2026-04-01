const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  rollNumber:    { type: String, required: true },   // ← NOT globally unique anymore
  email:         { type: String, required: true, unique: true },
  course:        { type: String, required: true },
  dateOfBirth:   { type: String, default: '' },
  gender:        { type: String, default: '' },
  phone:         { type: String, default: '' },
  address:       { type: String, default: '' },
  guardianName:  { type: String, default: '' },
  guardianPhone: { type: String, default: '' },
  photo:         { type: String, default: '' },
  age:           { type: Number, default: 0 },
  createdAt:     { type: Date, default: Date.now }
});

// ← Compound unique index: rollNumber unique PER course
studentSchema.index({ rollNumber: 1, course: 1 }, { unique: true });

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
