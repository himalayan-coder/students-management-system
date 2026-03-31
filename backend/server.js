const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/studentDB')
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch((error) => console.log('Error connecting to MongoDB:', error));

app.use('/api/students', studentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
