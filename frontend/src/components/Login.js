import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/auth/login', { username, password })
      .then((response) => {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('teacherName', response.data.name);
        navigate('/');
      })
      .catch(() => {
        setError('Invalid username or password. Please try again.');
      });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>🎓</h1>
          <h2>Student Management System</h2>
          <p>Teacher Login</p>
        </div>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username:</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" required />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
          </div>
          <button type="submit" className="btn-primary login-btn">Login</button>
        </form>
        <p className="login-hint">Default: admin / admin123</p>
      </div>
    </div>
  );
}

export default Login;
