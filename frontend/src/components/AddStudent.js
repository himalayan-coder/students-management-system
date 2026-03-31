import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddStudent() {
  const [formData, setFormData] = useState({ name: '', rollNumber: '', email: '', course: '', age: '' });
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/students', formData)
      .then(() => { setMessage('Student added successfully!'); setError(''); setFormData({ name: '', rollNumber: '', email: '', course: '', age: '' }); setTimeout(() => navigate('/'), 1500); })
      .catch(() => { setError('Error adding student. Roll number may already exist.'); setMessage(''); });
  };

  return (
    <div className="card">
      <h2>Add New Student</h2>
      {message && <p className="success-msg">{message}</p>}
      {error   && <p className="error-msg">{error}</p>}
      <form onSubmit={handleSubmit}>
        {['name','rollNumber','email','course','age'].map((field) => (
          <div className="form-group" key={field}>
            <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
            <input type={field === 'age' ? 'number' : field === 'email' ? 'email' : 'text'} name={field} value={formData[field]} onChange={handleChange} required />
          </div>
        ))}
        <button type="submit" className="btn-primary">Add Student</button>
      </form>
    </div>
  );
}
export default AddStudent;
