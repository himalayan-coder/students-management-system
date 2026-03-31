// ChangePassword.js - Teacher can change their own password

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message,         setMessage]         = useState('');
  const [error,           setError]           = useState('');

  const navigate  = useNavigate();
  const username  = localStorage.getItem('teacherUsername');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(''); setError('');

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match!');
    }
    if (newPassword.length < 6) {
      return setError('New password must be at least 6 characters!');
    }

    axios.put('http://localhost:5000/api/auth/change-password', {
      username, currentPassword, newPassword
    })
      .then(() => {
        setMessage('Password changed successfully! Please login again.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Error changing password.');
      });
  };

  return (
    <div className="card" style={{ maxWidth: '450px', margin: '0 auto' }}>
      <h2>🔑 Change Password</h2>
      <br />
      {message && <p className="success-msg">{message}</p>}
      {error   && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Current Password:</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="Enter current password" />
        </div>
        <div className="form-group">
          <label>New Password:</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Enter new password (min 6 chars)" />
        </div>
        <div className="form-group">
          <label>Confirm New Password:</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Re-enter new password" />
        </div>
        <button type="submit" className="btn-primary">Change Password</button>
        <button type="button" style={{ marginLeft: '10px', backgroundColor: '#95a5a6', color: 'white' }} onClick={() => navigate('/')}>Cancel</button>
      </form>
    </div>
  );
}

export default ChangePassword;
