// ManageTeachers.js - Admin can add/delete teacher accounts

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ManageTeachers() {
  const [teachers,    setTeachers]    = useState([]);
  const [name,        setName]        = useState('');
  const [username,    setUsername]    = useState('');
  const [password,    setPassword]    = useState('');
  const [role,        setRole]        = useState('teacher');
  const [message,     setMessage]     = useState('');
  const [error,       setError]       = useState('');

  const navigate    = useNavigate();
  const currentRole = localStorage.getItem('teacherRole');

  // Only admin can access this page
  useEffect(() => {
    if (currentRole !== 'admin') {
      navigate('/');
    } else {
      fetchTeachers();
    }
  }, []);

  const fetchTeachers = () => {
    axios.get('http://localhost:5000/api/auth/teachers')
      .then((res) => setTeachers(res.data))
      .catch((err) => console.log('Error:', err));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setMessage(''); setError('');

    axios.post('http://localhost:5000/api/auth/register', { name, username, password, role })
      .then(() => {
        setMessage(`Teacher "${name}" registered successfully!`);
        setName(''); setUsername(''); setPassword(''); setRole('teacher');
        fetchTeachers();
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Error registering teacher.');
      });
  };

  const handleDelete = (id, tname) => {
    if (window.confirm(`Delete teacher "${tname}"?`)) {
      axios.delete(`http://localhost:5000/api/auth/teachers/${id}`)
        .then(() => { setMessage(`Teacher "${tname}" deleted.`); fetchTeachers(); })
        .catch((err) => console.log('Error:', err));
    }
  };

  return (
    <div>
      {/* Add New Teacher Form */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2>➕ Add New Teacher</h2>
        <br />
        {message && <p className="success-msg">{message}</p>}
        {error   && <p className="error-msg">{error}</p>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Full Name:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Ramesh Kumar" />
          </div>
          <div className="form-group">
            <label>Username:</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="e.g. ramesh123" />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min 6 characters" />
          </div>
          <div className="form-group">
            <label>Role:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="filter-select" style={{ width: '100%', padding: '10px' }}>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Register Teacher</button>
        </form>
      </div>

      {/* All Teachers Table */}
      <div className="card">
        <h2>👥 All Teachers ({teachers.length})</h2>
        <br />
        {teachers.length === 0 ? (
          <p>No teachers found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t, i) => (
                <tr key={t._id}>
                  <td>{i + 1}</td>
                  <td>{t.name}</td>
                  <td>{t.username}</td>
                  <td><span className={`role-badge role-${t.role}`}>{t.role}</span></td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>
                    {t.username !== 'admin' && (
                      <button className="btn-delete" onClick={() => handleDelete(t._id, t.name)}>Delete</button>
                    )}
                    {t.username === 'admin' && <span style={{ color: '#999', fontSize: '12px' }}>Protected</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ManageTeachers;
