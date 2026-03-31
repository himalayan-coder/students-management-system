const express = require('express');
const router = express.Router();

const TEACHER = {
  username: 'admin',
  password: 'admin123',
  name: 'Teacher'
};

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === TEACHER.username && password === TEACHER.password) {
    res.json({ success: true, name: TEACHER.name, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
});

module.exports = router;
