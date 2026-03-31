const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const studentRoutes = require('./routes/studentRoutes');
const authRoutes    = require('./routes/authRoutes');

const app  = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

// Serve uploaded photos as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect('mongodb://localhost:27017/studentDB')
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch((error) => console.log('Error connecting to MongoDB:', error));

app.use('/api/students', studentRoutes);
app.use('/api/auth',     authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
