const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  email:      { type: String, required: true },
  course:     { type: String, required: true },
  age:        { type: Number, required: true }
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
